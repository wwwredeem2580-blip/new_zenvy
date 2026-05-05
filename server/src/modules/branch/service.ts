import { Branch, IBranch } from '../../models/Branch.model';
import CustomError from '../../utils/CustomError';
import { BranchInput } from './schema';

export const listBranches = async (adminView: boolean = false): Promise<IBranch[]> => {
  const query = adminView ? {} : { isActive: true };
  return await Branch.find(query).sort({ isMain: -1, createdAt: -1 });
};

export const getBranchById = async (id: string): Promise<IBranch> => {
  const branch = await Branch.findById(id);
  if (!branch) {
    throw new CustomError('Branch not found', 404);
  }
  return branch;
};

export const createBranch = async (data: BranchInput): Promise<IBranch> => {
  if (data.isMain) {
    await Branch.updateMany({}, { $set: { isMain: false } });
  }

  // If this is the first branch, make it main by default
  if (!data.isMain) {
    const count = await Branch.countDocuments();
    if (count === 0) {
      data.isMain = true;
    }
  }

  const branch = new Branch(data);
  await branch.save();
  return branch;
};

export const updateBranch = async (id: string, data: BranchInput): Promise<IBranch> => {
  const branch = await Branch.findById(id);
  if (!branch) {
    throw new CustomError('Branch not found', 404);
  }

  if (data.isMain && !branch.isMain) {
    await Branch.updateMany({ _id: { $ne: id } }, { $set: { isMain: false } });
  }

  Object.assign(branch, data);
  await branch.save();
  return branch;
};

export const deleteBranch = async (id: string): Promise<void> => {
  const branch = await Branch.findById(id);
  if (!branch) {
    throw new CustomError('Branch not found', 404);
  }

  if (branch.isMain) {
    const nextBranch = await Branch.findOne({ _id: { $ne: id } });
    if (nextBranch) {
      nextBranch.isMain = true;
      await nextBranch.save();
    }
  }

  await Branch.findByIdAndDelete(id);
};
