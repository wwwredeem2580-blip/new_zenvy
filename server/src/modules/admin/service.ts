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
