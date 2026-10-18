import os
import uuid
import aiofiles
from fastapi import UploadFile
from src.core.config import settings


class StorageService:
    def __init__(self, base_dir: str = settings.UPLOAD_DIR):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    async def save_receipt_file(self, tenant_id: str, file: UploadFile) -> tuple[str, str]:
        """
        Salva o arquivo enviado em pasta isolada por tenant.
        Retorna (file_path, file_url).
        """
        tenant_folder = os.path.join(self.base_dir, tenant_id)
        os.makedirs(tenant_folder, exist_ok=True)

        # Gera nome único para evitar colisões
        extension = os.path.splitext(file.filename or "")[1] or ".jpg"
        unique_filename = f"{uuid.uuid4().hex}{extension}"
        destination_path = os.path.join(tenant_folder, unique_filename)

        async with aiofiles.open(destination_path, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)

        # URL relativa para servir o arquivo estático
        file_url = f"/static/uploads/{tenant_id}/{unique_filename}"
        return destination_path, file_url


storage_service = StorageService()
