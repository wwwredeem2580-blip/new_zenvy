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

/**
 * getDashboardAnalytics - Aggregates real revenue, pending revenue, and graphical timeseries data.
 */
export const getDashboardAnalytics = async () => {
  const applications = await Application.find();

  let totalRevenue = 0;
  let pendingRevenue = 0;
  let statuses = { Pending: 0, Reviewing: 0, Approved: 0, Rejected: 0 };

  // For charts: last 7 days of revenue inflow
  const last7Days: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
  }

  applications.forEach((app) => {
    // Tally Statuses
    if (app.status in statuses) {
      statuses[app.status as keyof typeof statuses] += 1;
    }

    // Calculate Application Total
    const appTotal = app.selectedServices.reduce((sum, s) => sum + s.price, 0);

    if (app.paymentStatus === 'Received') {
      totalRevenue += appTotal;
      
      // Chart Data grouping
      const d = new Date((app as any).createdAt || (app as any).submittedAt || new Date());
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (last7Days[dateStr] !== undefined) {
        last7Days[dateStr] += appTotal;
      }
    } else {
      pendingRevenue += appTotal;
    }
  });

  const chartData = Object.keys(last7Days).map((date) => ({
    date,
    revenue: last7Days[date],
  }));

  return {
    totalRevenue,
    pendingRevenue,
    statuses,
    chartData,
  };
};
