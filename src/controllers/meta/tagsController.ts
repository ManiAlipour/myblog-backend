import { Request, Response } from "express";
import Tag from "../../models/Tag";
import { filterTag } from "../../utils/filterMethods";
import {
  handleError,
  handleSuccess,
  objectIdPatternCheck,
  useValidationResult,
} from "../../utils/authfunctionalities";
import messages, { STATUS_CODES } from "../../utils/constants/messages";

export async function getAllTags(req: Request, res: Response) {
  try {
    const tags = await Tag.find({});
    handleSuccess(
      res,
      tags.map(filterTag),
      messages.TAG_LIST_RETRIEVED,
      STATUS_CODES.OK
    );
  } catch (error) {
    handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, messages.ERROR);
  }
}

export async function addNewTag(req: Request, res: Response) {
  if (useValidationResult({ req, res })) return;
  let { name, slug } = req.body;
  name = name?.trim();
  slug = slug?.trim().toLowerCase();

  try {
    const isTagValid = await Tag.findOne({ slug });

    if (isTagValid)
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.TAG_EXISTS
      );

    const tag = new Tag({ name, slug });
    const savedTag = await tag.save();

    return handleSuccess(
      res,
      filterTag(savedTag),
      messages.TAG_ADDED,
      STATUS_CODES.CREATED
    );
  } catch (error) {
    handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, messages.ERROR);
  }
}

export async function getOneTag(req: Request, res: Response) {
  const { id } = req.params;

  try {
    if (!objectIdPatternCheck(id))
      return handleError(
        res,
        null,
        STATUS_CODES.FORBIDDEN,
        messages.INVALID_TAG_ID
      );

    const tag = await Tag.findById(id);

    if (!tag)
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.TAG_NOT_FOUND
      );

    return handleSuccess(
      res,
      filterTag(tag),
      messages.TAG_LIST_RETRIEVED,
      STATUS_CODES.OK
    );
  } catch (error) {
    handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, messages.ERROR);
  }
}

export async function editTag(req: Request, res: Response) {
  if (useValidationResult({ req, res })) return;

  const { id } = req.params;

  try {
    if (!objectIdPatternCheck(id))
      return handleError(
        res,
        null,
        STATUS_CODES.FORBIDDEN,
        messages.INVALID_TAG_ID
      );

    const tag = await Tag.findById(id);

    if (!tag)
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.TAG_NOT_FOUND
      );

    const { name, slug } = req.body;

    if (name !== undefined) tag.name = name.trim();
    if (slug !== undefined) tag.slug = slug.trim().toLowerCase();
    await tag.save();

    return handleSuccess(
      res,
      filterTag(tag),
      messages.TAG_EDITED,
      STATUS_CODES.OK
    );
  } catch (error) {
    handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, messages.ERROR);
  }
}

export async function deleteTag(req: Request, res: Response) {
  const { id } = req.params;

  try {
    if (!objectIdPatternCheck(id))
      return handleError(
        res,
        null,
        STATUS_CODES.FORBIDDEN,
        messages.INVALID_TAG_ID
      );

    const tag = await Tag.findById(id);
    if (!tag)
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.TAG_NOT_FOUND
      );
    await Tag.findByIdAndDelete(id);

    return handleSuccess(
      res,
      filterTag(tag),
      messages.TAG_DELETED,
      STATUS_CODES.OK
    );
  } catch (error) {
    handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, messages.ERROR);
  }
}
