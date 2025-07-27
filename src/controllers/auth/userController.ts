import { Request, Response } from "express";
import User from "../../models/User";
import {
  useValidationResult,
  handleError,
  handleSuccess,
  objectIdPatternCheck,
} from "../../utils/funcs/authfunctionalities";
import { filterUser } from "../../utils/funcs/filterMethods";
import messages, { STATUS_CODES } from "../../utils/constants/messages";
import { AuthRequest } from "../../middleware/authMiddleware";
import { uploadFile } from "../../utils/services/cloude";

export async function getProfile(req: AuthRequest, res: Response) {
  const user = req.user;

  try {
    const filteredUser = filterUser(user);

    return handleSuccess(
      res,
      filteredUser,
      messages.PROFILE_RETRIEVED_SUCCESS,
      200
    );
  } catch (error) {
    handleError(res, error, 500, messages.SERVER_ERROR);
  }
}

export async function editProfile(req: AuthRequest, res: Response) {
  if (useValidationResult({ req, res })) return;

  const { username, name, bio, avatar } = req.body;

  try {
    if (username && username !== req.user.username) {
      const userWithSameUsername = await User.findOne({ username });
      if (
        userWithSameUsername &&
        userWithSameUsername._id.toString() !== req.user._id.toString()
      ) {
        return handleError(
          res,
          null,
          409,
          messages.USERNAME_ALREADY_USED_BY_ANOTHER_USER
        );
      }
    }

    const updates: any = {};
    if (username !== undefined) updates.username = username;
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    });

    if (!updatedUser) {
      return handleError(res, null, 404, messages.USER_NOT_FOUND);
    }

    const filteredUser = filterUser(updatedUser);

    return handleSuccess(
      res,
      filteredUser,
      messages.PROFILE_UPDATED_SUCCESS,
      200
    );
  } catch (error) {
    console.error(error);
    handleError(res, error, 500, messages.SERVER_ERROR);
  }
}

export async function setUserAvatar(req: AuthRequest, res: Response) {
  const file = req.file;
  const { _id: id } = req.user;

  try {
    if (!file)
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        "آواتار دریافت نشد."
      );

    if (!id || !objectIdPatternCheck(id))
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.INVALID_USER_ID
      );

    const user = await User.findById(id);

    if (!user)
      return handleError(
        res,
        null,
        STATUS_CODES.NOT_FOUND,
        messages.USER_NOT_FOUND
      );
    const safeUsername = user.username.replace(/[^\w\d_-]/g, "");
    const filename = `${safeUsername}-${Date.now()}-${file?.originalname}`;

    const avatar = await uploadFile(`profiles/${filename}`, file!);

    user.avatar = avatar;

    const savedUser = await user.save();

    return handleSuccess(res, { user: filterUser(savedUser) });
  } catch (error) {
    handleError(res, error, 500, messages.SERVER_ERROR);
  }
}
