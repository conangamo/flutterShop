from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class PaymentMethodType(str, Enum):
    """Payment method categories supported by the frontend checkout."""
    CREDIT_CARD = "CREDIT_CARD"
    COD = "COD"
    E_WALLET = "E_WALLET"


class OrderLineIn(BaseModel):
    product_id: str = Field(alias="productId")
    variant_id: str | None = Field(default=None, alias="variantId")
    quantity: int = Field(ge=1)

    model_config = {"populate_by_name": True}


class OrderCreateIn(BaseModel):
    items: list[OrderLineIn] = Field(min_length=1)
    shipping_address_id: str = Field(alias="shippingAddressId")
    payment_method_code: str = Field(alias="paymentMethod")
    payment_method_type: PaymentMethodType = Field(alias="paymentMethodType")
    promo_code: str | None = Field(default=None, alias="promoCode")
    shipping_fee: Decimal = Field(default=Decimal("0"), alias="shippingFee")
    discount_total: Decimal = Field(default=Decimal("0"), alias="discountTotal")
    note: str | None = Field(default=None, max_length=500)

    @field_validator("payment_method_type", mode="before")
    @classmethod
    def validate_payment_method_type(cls, v):
        """Validate and normalize payment method type."""
        if isinstance(v, str):
            v = v.upper()
            if v not in ["CREDIT_CARD", "COD", "E_WALLET"]:
                raise ValueError(
                    f"Invalid payment method type: {v}. Must be one of: CREDIT_CARD, COD, E_WALLET"
                )
        return v

    model_config = {"populate_by_name": True}


class OrderStatusUpdateIn(BaseModel):
    status: str = Field(description="processing | shipped | delivered | cancelled")
    note: str | None = Field(default=None, max_length=200)
    tracking_number: str | None = Field(default=None, alias="trackingNumber", max_length=120)

    model_config = {"populate_by_name": True}


class VoucherValidateIn(BaseModel):
    """Request to validate a voucher code against current cart."""
    code: str = Field(min_length=1, max_length=50)
    subtotal: Decimal = Field(gt=0, description="Cart subtotal before shipping and discount")

    model_config = {"populate_by_name": True}


class VoucherValidateOut(BaseModel):
    """Response with voucher validation result."""
    valid: bool
    code: str
    discount_type: str | None = Field(default=None, alias="discountType")
    discount_value: float | None = Field(default=None, alias="discountValue")
    discount_amount: float | None = Field(default=None, alias="discountAmount")
    max_discount: float | None = Field(default=None, alias="maxDiscount")
    min_order_total: float | None = Field(default=None, alias="minOrderTotal")
    error_message: str | None = Field(default=None, alias="errorMessage")

    model_config = {"populate_by_name": True}
