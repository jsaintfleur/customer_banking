"""Display formatting and the engine's single rounding boundary.

Policy: all engine math runs at full float precision; monetary values are
rounded to cents exactly once, here, using banker's rounding
(ROUND_HALF_EVEN) via Decimal. The TypeScript web engine applies the same
policy so CLI and web output agree to the cent.
"""

from __future__ import annotations

from decimal import ROUND_HALF_EVEN, Decimal

_CURRENCY_SYMBOLS = {"USD": "$", "EUR": "€", "GBP": "£", "CAD": "CA$"}


def round_currency(value: float) -> Decimal:
    """Round a monetary float to cents with banker's rounding."""
    # str() round-trips the shortest exact representation of the float,
    # avoiding artifacts like Decimal(0.1) == 0.1000000000000000055511151231.
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN)


def format_currency(value: float, currency: str = "USD") -> str:
    """Format a monetary value for display, e.g. 1234.5 → "$1,234.50"."""
    symbol = _CURRENCY_SYMBOLS.get(currency.upper())
    if symbol is None:
        raise ValueError(f"Unsupported currency: {currency}")
    quantized = round_currency(value)
    sign = "-" if quantized < 0 else ""
    return f"{sign}{symbol}{abs(quantized):,.2f}"


def format_percent(fraction: float, decimals: int = 2) -> str:
    """Format a fractional rate for display, e.g. 0.0512 → "5.12%"."""
    return f"{fraction * 100:.{decimals}f}%"
