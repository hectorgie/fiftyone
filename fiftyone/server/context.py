"""
FiftyOne Server context

| Copyright 2017-2022, Voxel51, Inc.
| `voxel51.com <https://voxel51.com/>`_
|
"""
import motor.motor_asyncio as mtr
import starlette.requests as strq
import starlette.responses as strp
import strawberry.asgi as gqla


import fiftyone as fo
import fiftyone.constants as foc

from fiftyone.server.data import Context
from fiftyone.server.dataloader import dataloaders, get_dataloader


class GraphQL(gqla.GraphQL):
    async def get_context(
        self, request: strq.Request, response: strp.Response
    ) -> Context:
        db_client = mtr.AsyncIOMotorClient(fo.config.database_uri)
        db = db_client[foc.DEFAULT_DATABASE]
        session = await db_client.start_session()
        loaders = {}
        for cls, config in dataloaders.items():
            loaders[cls] = get_dataloader(cls, config, db, session)

        return Context(
            db=db,
            session=session,
            dataloaders=loaders,
            request=request,
            response=response,
        )
