import { Request, Response } from "express";
import User from "../../models/User";
import {
  useValidationResult,
  handleError,
  handleSuccess,
} from "../../utils/funcs/authfunctionalities";
import { filterUser } from "../../utils/funcs/filterMethods";
import messages from "../../utils/constants/messages";
import { AuthRequest } from "../../middleware/authMiddleware";

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

export async function getAllUsers(req: Request, res: Response) {
  try {
    const { search, id, sort, role, status } = req.query;
    // Search by ID (exact) with ObjectId validation
    if (id) {
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      if (typeof id !== "string" || !objectIdPattern.test(id)) {
        return handleError(res, null, 400, messages.INVALID_USER_ID);
      }
      const user = await User.findById(id as string);
      if (!user) {
        return handleError(res, null, 404, messages.USER_NOT_FOUND);
      }
      return handleSuccess(
        res,
        [filterUser(user)],
        messages.USER_FOUND_SUCCESS,
        200
      );
    }

    // Search by text (username, name, email)
    let query: any = {};
    if (search) {
      const regex = new RegExp(search as string, "i");
      query.$or = [{ username: regex }, { name: regex }, { email: regex }];
    }
    // Filter by role
    if (role) {
      query.role = role;
    }
    // Filter by status (isActive)
    if (status !== undefined) {
      if (status === "active") query.isActive = true;
      else if (status === "inactive") query.isActive = false;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    let sortOption: any = { createdAt: -1 }; // Default: newest
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "username") sortOption = { username: 1 };
    else if (sort === "email") sortOption = { email: 1 };
    else if (sort === "name") sortOption = { name: 1 };
    else if (sort === "role") sortOption = { role: 1 };

    const [users, total] = await Promise.all([
      User.find(query).sort(sortOption).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    const filteredUsers = users.map((user) => filterUser(user));
    return handleSuccess(
      res,
      {
        data: filteredUsers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      messages.USERS_LIST_RETRIEVED_SUCCESS,
      200
    );
  } catch (error) {
    handleError(res, error, 500, messages.SERVER_ERROR);
  }
}
