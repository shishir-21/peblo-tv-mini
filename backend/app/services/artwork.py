from io import BytesIO

from PIL import Image


ARTWORK_SPECS = {
    "poster": {
        "width": 600,
        "height": 900,
        "max_kb": 200,
    },
    "banner": {
        "width": 1280,
        "height": 720,
        "max_kb": 200,
    },
    "thumbnail": {
        "width": 640,
        "height": 360,
        "max_kb": 200,
    },
}


def validate_artwork(
    artwork_type: str,
    file_bytes: bytes,
) -> None:
    if artwork_type not in ARTWORK_SPECS:
        raise ValueError(
            f"Unsupported artwork type: {artwork_type}. "
            "Allowed types are poster, banner, and thumbnail."
        )

    spec = ARTWORK_SPECS[artwork_type]

    file_size_kb = len(file_bytes) / 1024

    if file_size_kb > spec["max_kb"]:
        raise ValueError(
            f"{artwork_type} must be no larger than "
            f"{spec['max_kb']} KB."
        )

    try:
        image = Image.open(BytesIO(file_bytes))
        width, height = image.size
    except Exception as exc:
        raise ValueError("The uploaded file is not a valid image.") from exc

    if width != spec["width"] or height != spec["height"]:
        raise ValueError(
            f"{artwork_type} must be exactly "
            f"{spec['width']}x{spec['height']} pixels. "
            f"Received {width}x{height}."
        )
        