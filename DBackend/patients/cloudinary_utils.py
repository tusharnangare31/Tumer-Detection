import cloudinary.uploader

def upload_image_to_cloudinary(file_obj, folder):
    """
    Uploads a file to Cloudinary.
    Returns secure_url.
    """
    result = cloudinary.uploader.upload(
        file_obj,
        folder=folder,
        resource_type="image",
    )
    return result["secure_url"]
