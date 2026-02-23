import { Request, Response } from "express";
import * as userService from "../services/user.service";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await userService.deleteUser(id);
    res.json(result);
  } catch (error: any) {
    if (error.message === "User not found") {
      res.status(404).json({ message: error.message });
    } else if (error.message === "Cannot delete non-user roles") {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};
