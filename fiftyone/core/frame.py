"""
Video frames.

| Copyright 2017-2020, Voxel51, Inc.
| `voxel51.com <https://voxel51.com/>`_
|
"""
from collections import defaultdict
import weakref

from fiftyone.core._sample import _Sample
import fiftyone.core.frame_utils as fofu

from fiftyone.core.odm.frame import (
    NoDatasetFrameSampleDocument,
    DatasetFrameSampleDocument,
)


class Frames(object):
    """An ordered map of frames in a :class:`fiftyone.core.sample.Sample`

    Note:
        This class is instantiated automatically and depends on an owning
        :class:`fiftyone.core.sample.Sample`. Not for independent use or direct
        assignment to :class:`fiftyone.core.sample.Sample`s.
    """

    def _serve(self, sample):
        self._sample = sample
        return self

    def __repr__(self):
        return "<%s %d>" % (
            self.__class__.__name__,
            len(self._sample._doc.to_dict()["frames"]),
        )

    def __iter__(self):
        self._iter = self.keys()
        return self

    def __next__(self):
        return next(self._iter)

    def keys(self):
        """Iterator for the frame numbers in a video :class:`fiftyone.core.sample.Sample`.

        Returns:
            an iterator over the 1-based integer frame numbers in the owning
            :class:`fiftyone.core.sample.Sample`, ordered by frame number.
        """
        dataset = self._sample._dataset if self._sample._in_db else None
        for k in sorted(
            map(lambda k: int(k), self._sample._doc.frames.keys())
        ):
            yield int(k)

    def items(self):
        """Iterator for the frames in a video :class:`fiftyone.core.sample.Sample`.

        Returns:
            an tuple iterator of 1-based integer frame numbers in the owning
            :class:`fiftyone.core.sample.Sample` and the corresponding :class:`Frame`,
            ordered by frame number.
        """
        dataset = self._sample._dataset if self._sample._in_db else None
        for k in self.keys():
            yield k, Frame.from_doc(
                self._sample._doc.frames[str(k)], dataset=dataset
            )

    def values(self):
        """Iterator for the frames in a video :class:`fiftyone.core.sample.Sample`.

        Returns:
            an iterator over over the :class:`Frame`s in the owning
            :class:`fiftyone.core.sample.Sample`, ordered by the 1-based integer
            frame numbers.
        """
        dataset = self._sample._dataset if self._sample._in_db else None
        for k in self.keys():
            yield Frame.from_doc(
                self._sample._doc.frames[str(k)], dataset=dataset
            )

    def __getitem__(self, key):
        if fofu.is_frame_number(key):
            try:
                key = str(key)
                doc = self._sample._doc.frames[key]
            except KeyError:
                if self._sample._in_db:
                    doc = self._sample._dataset._frame_doc_cls.from_dict(
                        {"frame_number": key}
                    )
                    doc.save()
                    dataset = self._sample._dataset
                else:
                    doc = NoDatasetFrameSampleDocument(frame_number=key)
                    dataset = None
            frame = Frame.from_doc(doc, dataset=self._sample._dataset)
            self._sample._doc.frames[key] = frame._doc
            return frame

    def __setitem__(self, key, value):
        if fofu.is_frame_number(key):
            if not isinstance(value, Frame):
                raise ValueError("%s is not a Frame")

            d = value.to_dict()
            d.pop("_id", None)
            d["frame_number"] = key
            if self._sample._in_db:
                doc = self._sample._dataset._frame_doc_cls.from_dict(d)
                doc.save()
                self._sample._doc.frames[str(key)] = doc
            else:
                self._sample._doc.frames[
                    str(key)
                ] = NoDatasetFrameSampleDocument.from_dict(d)

    def _get_field_cls(self):
        return self._sample._doc.frames.__class__


class Frame(_Sample):
    """A frame in a video :class:`fiftyone.core.sample.Sample`

    Any `fiftyone.core.label.Label` or `fiftyone.core.fields.Field` that can
    assigned to an image :class:`fiftyone.core.sample.Sample` can also be
    assigned to a :class:`Frame`.
    """

    # Instance references keyed by [collection_name][sample_id]
    _instances = defaultdict(weakref.WeakValueDictionary)

    _COLL_CLS = DatasetFrameSampleDocument
    _NO_COLL_CLS = NoDatasetFrameSampleDocument

    def __init__(self, **kwargs):
        self._doc = NoDatasetFrameSampleDocument(**kwargs)
        super().__init__()

    def __str__(self):
        return repr(self)

    def __repr__(self):
        return self._doc.fancy_repr(class_name=self.__class__.__name__)

    def __getitem__(self, field_name):
        try:
            return self.get_field(field_name)
        except AttributeError:
            raise KeyError(
                "%s has no field '%s'" % (self.__class__.__name__, field_name)
            )

    def __setitem__(self, field_name, value):
        self.set_field(field_name, value=value)

    @classmethod
    def from_doc(cls, doc, dataset=None):
        """Creates an instance of the :class:`Frame` class backed by the given
        document.

        Args:
            doc: a :class:`fiftyone.core.odm.SampleDocument`
            dataset: the :class:`fiftyone.core.dataset.Dataset` that the frame
                belongs to

        Returns:
            a :class:`Frame`
        """
        from fiftyone.core.odm import NoDatasetFrameSampleDocument

        if isinstance(doc, NoDatasetFrameSampleDocument):
            sample = cls.__new__(cls)
            sample._dataset = None
            sample._doc = doc
            return sample

        if not doc.id:
            raise ValueError("`doc` is not saved to the database.")

        try:
            # Get instance if exists
            sample = cls._instances[doc.collection_name][str(doc.id)]
        except KeyError:
            sample = cls.__new__(cls)
            sample._doc = None  # set to prevent RecursionError
            if dataset is None:
                raise ValueError(
                    "`dataset` arg must be provided if sample is in a dataset"
                )
            sample._set_backing_doc(doc, dataset=dataset)

        return sample
