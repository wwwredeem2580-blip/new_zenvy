import { User } from '../../models/User.model';
import { Application } from '../../models/Application.model';

/**
 * listAgentsWithWorkload - Retrieves all agents and admins along with their current reviewing count.
 */
export const listAgentsWithWorkload = async () => {
  const agents = await User.find({ role: { $in: ['agent', 'admin'] } });
  
  const agentsWithWorkload = await Promise.all(
    agents.map(async (agent) => {
      const activeWorkload = await Application.countDocuments({
        reviewerId: agent._id,
        status: 'Reviewing',
      });
      
      return {
        id: agent._id.toString(),
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        role: agent.role,
        avatar: agent.avatar,
        activeWorkload,
      };
    })
  );
  
  return agentsWithWorkload;
};
/**
 * listAllUsers - Retrieves all registered users in the system.
 */
export const listAllUsers = async () => {
  const users = await User.find({}).sort({ createdAt: -1 });
  return users;
};

/**
 * updateUserRole - Promotes or changes a user's role.
 */
export const updateUserRole = async (userId: string, role: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  user.role = role as any;
  await user.save();
  return user;
};

/**
 * addCredits - Issues balance/credits to a user.
 */
export const addCredits = async (userId: string, amount: number) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  user.balance = (user.balance || 0) + amount;
  await user.save();
  return user;
};
