from __future__ import annotations

from sqlalchemy import and_, exists, func, select, tuple_
from sqlalchemy.orm import Session

from app.db.models import Category, Product, ProductImage, ProductVariant


def list_categories(db: Session, store_id: int) -> list[dict]:
    rows = db.execute(
        select(Category).where(Category.store_id == store_id, Category.deleted_at.is_(None)).order_by(Category.label)
    ).scalars().all()
    return [{"id": c.id, "label": c.label, "image": c.image or ""} for c in rows]


def _master_price(p: Product) -> float:
    if p.sale_price is not None:
        return float(p.sale_price)
    return float(p.base_price)


def _serialize_variant(v: ProductVariant, fallback_price: float) -> dict:
    return {
        "id": v.id,
        "color": v.color,
        "size": v.size,
        "sku": v.sku,
        "price": float(v.price) if v.price is not None else fallback_price,
        "stock": v.stock,
        "image": v.image,
    }


def _load_variants_bulk(db: Session, keys: list[tuple[int, str]]) -> dict[tuple[int, str], list[ProductVariant]]:
    if not keys:
        return {}
    stmt = (
        select(ProductVariant)
        .where(
            tuple_(ProductVariant.store_id, ProductVariant.product_id).in_(keys),
            ProductVariant.deleted_at.is_(None),
        )
        .order_by(ProductVariant.position)
    )
    rows = db.execute(stmt).scalars().all()
    out: dict[tuple[int, str], list[ProductVariant]] = {}
    for v in rows:
        k = (v.store_id, v.product_id)
        out.setdefault(k, []).append(v)
    return out


def _load_images_bulk(db: Session, keys: list[tuple[int, str]]) -> dict[tuple[int, str], list[ProductImage]]:
    if not keys:
        return {}
    stmt = (
        select(ProductImage)
        .where(tuple_(ProductImage.store_id, ProductImage.product_id).in_(keys))
        .order_by(ProductImage.position)
    )
    rows = db.execute(stmt).scalars().all()
    out: dict[tuple[int, str], list[ProductImage]] = {}
    for img in rows:
        k = (img.store_id, img.product_id)
        out.setdefault(k, []).append(img)
    return out


_SORT_OPTIONS = {"newest", "price_asc", "price_desc", "rating_desc", "name_asc"}


def _catalog_price_expr():
    return func.coalesce(Product.sale_price, Product.base_price)


def _catalog_filter_clause(
    *,
    store_id: int,
    category_id: str | None,
    min_price: float | None,
    max_price: float | None,
    search: str | None,
    size: str | None,
    color: str | None,
    in_stock: bool | None,
):
    """Điều kiện WHERE chung cho list + count (tránh lệch phân trang)."""
    eff = _catalog_price_expr()
    conds = [
        Product.store_id == store_id,
        Product.deleted_at.is_(None),
        Product.is_active.is_(True),
    ]
    if category_id:
        conds.append(Product.category_id == category_id)
    if search:
        conds.append(Product.name.ilike(f"%{search}%"))
    if min_price is not None:
        conds.append(eff >= min_price)
    if max_price is not None:
        conds.append(eff <= max_price)

    if size or color or in_stock:
        v_cond = [
            ProductVariant.store_id == Product.store_id,
            ProductVariant.product_id == Product.id,
            ProductVariant.deleted_at.is_(None),
        ]
        if size:
            v_cond.append(ProductVariant.size == size)
        if color:
            v_cond.append(ProductVariant.color == color)
        if in_stock:
            v_cond.append(ProductVariant.stock > 0)
        conds.append(exists().where(and_(*v_cond)))

    return eff, and_(*conds)


def count_products(
    db: Session,
    store_id: int,
    *,
    category_id: str | None,
    min_price: float | None,
    max_price: float | None,
    search: str | None,
    size: str | None = None,
    color: str | None = None,
    in_stock: bool | None = None,
) -> int:
    _, filt = _catalog_filter_clause(
        store_id=store_id,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        search=search,
        size=size,
        color=color,
        in_stock=in_stock,
    )
    n = db.scalar(select(func.count(Product.id)).where(filt))
    return int(n or 0)


def list_products(
    db: Session,
    store_id: int,
    *,
    category_id: str | None,
    min_price: float | None,
    max_price: float | None,
    search: str | None,
    size: str | None = None,
    color: str | None = None,
    in_stock: bool | None = None,
    sort: str | None = None,
    limit: int,
    offset: int,
) -> list[dict]:
    eff, filt = _catalog_filter_clause(
        store_id=store_id,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        search=search,
        size=size,
        color=color,
        in_stock=in_stock,
    )
    q = select(Product).where(filt)

    sort_key = (sort or "").strip()
    if sort_key not in _SORT_OPTIONS:
        sort_key = "newest"
    if sort_key == "price_asc":
        q = q.order_by(eff.asc(), Product.name.asc())
    elif sort_key == "price_desc":
        q = q.order_by(eff.desc(), Product.name.asc())
    elif sort_key == "rating_desc":
        q = q.order_by(Product.rating_avg.desc(), Product.review_count.desc())
    elif sort_key == "name_asc":
        q = q.order_by(Product.name.asc())
    else:
        q = q.order_by(Product.created_at.desc(), Product.name.asc())

    q = q.offset(offset).limit(limit)
    products = db.execute(q).scalars().all()
    keys = [(p.store_id, p.id) for p in products]
    vmap = _load_variants_bulk(db, keys)
    imap = _load_images_bulk(db, keys)

    out = []
    for p in products:
        price = _master_price(p)
        vars_ = vmap.get((p.store_id, p.id), [])
        imgs = imap.get((p.store_id, p.id), [])
        desc = p.short_description or (p.description[:160] + "…" if len(p.description) > 160 else p.description)
        var_list = [_serialize_variant(v, price) for v in vars_] if vars_ else [
            {
                "id": f"{p.id}-default",
                "sku": p.id,
                "size": None,
                "color": None,
                "price": price,
                "stock": p.total_stock,
                "image": p.default_image,
            }
        ]
        out.append(
            {
                "id": p.id,
                "name": p.name,
                "image": p.default_image,
                "description": desc,
                "price": price,
                "compareAtPrice": float(p.compare_at_price) if p.compare_at_price is not None else None,
                "rating": float(p.rating_avg),
                "reviews": p.review_count,
                "categoryId": p.category_id,
                "discount": p.discount_label,
                "brand": p.brand,
                "shoeType": str(p.shoe_type) if p.shoe_type is not None else None,
                "genderTarget": str(p.gender_target) if p.gender_target is not None else None,
                "totalStock": p.total_stock,
                "images": [i.url for i in imgs],
                "variants": var_list,
            }
        )
    return out


def get_product(db: Session, store_id: int, product_id: str) -> dict | None:
    p = db.execute(
        select(Product).where(
            Product.store_id == store_id,
            Product.id == product_id,
            Product.deleted_at.is_(None),
        )
    ).scalar_one_or_none()
    if not p:
        return None
    price = _master_price(p)
    variants = db.execute(
        select(ProductVariant)
        .where(
            ProductVariant.store_id == store_id,
            ProductVariant.product_id == product_id,
            ProductVariant.deleted_at.is_(None),
        )
        .order_by(ProductVariant.position)
    ).scalars().all()
    images = db.execute(
        select(ProductImage)
        .where(ProductImage.store_id == store_id, ProductImage.product_id == product_id)
        .order_by(ProductImage.position)
    ).scalars().all()
    var_list = [_serialize_variant(v, price) for v in variants] if variants else [
        {
            "id": f"{p.id}-default",
            "sku": p.id,
            "size": None,
            "color": None,
            "price": price,
            "stock": p.total_stock,
            "image": p.default_image,
        }
    ]
    return {
        "id": p.id,
        "name": p.name,
        "image": p.default_image,
        "description": p.description,
        "shortDescription": p.short_description,
        "price": price,
        "compareAtPrice": float(p.compare_at_price) if p.compare_at_price is not None else None,
        "rating": float(p.rating_avg),
        "reviews": p.review_count,
        "categoryId": p.category_id,
        "discount": p.discount_label,
        "currency": str(p.currency).strip(),
        "brand": p.brand,
        "shoeType": str(p.shoe_type) if p.shoe_type is not None else None,
        "genderTarget": str(p.gender_target) if p.gender_target is not None else None,
        "season": str(p.season) if p.season is not None else None,
        "usageType": str(p.usage_type) if p.usage_type is not None else None,
        "soleMaterial": p.sole_material,
        "upperMaterial": p.upper_material,
        "closureType": str(p.closure_type) if p.closure_type is not None else None,
        "totalStock": p.total_stock,
        "images": [i.url for i in images],
        "variants": var_list,
        "attributes": p.attributes if p.attributes else None,
    }
