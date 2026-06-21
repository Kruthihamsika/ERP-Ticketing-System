from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes.attachments import router as attachments_router
from app.routes.auth import router as auth_router
from app.routes.dashboard import router as dashboard_router
from app.routes.tickets import router as tickets_router
from app.routes.users import router as users_router


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
        docs_url="/docs" if settings.enable_docs else None,
        redoc_url="/redoc" if settings.enable_docs else None,
        openapi_url="/openapi.json" if settings.enable_docs else None,
    )

    print("========== ERP Ticketing Startup ==========")
    print("ALLOWED ORIGINS:", settings.cors_origins)
    print("==========================================")

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=settings.cors_allow_credentials,
        allow_methods=settings.cors_allow_methods,
        allow_headers=settings.cors_allow_headers,
    )

    register_routes(application)

    return application


def register_routes(application: FastAPI) -> None:
    application.include_router(auth_router)
    application.include_router(tickets_router)
    application.include_router(attachments_router)
    application.include_router(dashboard_router)
    application.include_router(users_router)

    @application.get("/", tags=["Application"])
    def root():
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "environment": settings.environment,
            "status": "running",
        }

    @application.get("/health", tags=["Health"])
    def health():
        return {"status": "healthy"}


app = create_application()