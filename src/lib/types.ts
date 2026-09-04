export type DeliveryStatus =
  | "CREATED"
  | "ASSIGNED"
  | "ONDELIVERY"
  | "COMPLETED"
  | "NOTDELIVERED"
  | "DELETED"
  | "RELEASED";

export type Delivery = {
  id: string;
  orderId: string | null;
  name: string | null; // nome del business, denormalizzato
  recipient: string | null;
  deliveryAddress: string | null;
  pickupAddress: string | null;
  status: DeliveryStatus;
  isAssigned: boolean;
  schedulingDelivery: string;
  totalPaid: number;
  compensation: number;
  businessId: string;
  mobile?: string | null;
  phone?: string | null;
  note?: string | null;
  assignedToRaiderId: string | null;
  assignedToRaider?: {
    id: string;
    name: string;
    surname: string;
    vehicle?: string | null;
  } | null;
  createdAt: string;
};

export type Pagination = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type DeliveriesResponse = {
  deliveries: Delivery[];
  pagination: Pagination;
};

export type Vehicle =
  | "CAR"
  | "BICYCLE"
  | "MOTORCYCLE"
  | "VAN"
  | "REFRIGERATEDVAN"
  | "WITHOUTVEHICLE"
  | "TRANSIT";

export type Business = {
  id: string;
  name: string;
  address: string;
  coordinates: string | null;
  email?: string;
  confirmed?: boolean;
  expired?: boolean;
  imgUrl?: string;
  activeRaiders: number;
  assignedLogistics?: { id: string; name: string }[];
  stats: { totalOrders: number; completedOrders: number };
  createdAt: string;
};

export type BusinessesResponse = {
  businesses: Business[];
  pagination: Pagination;
};

export type LogisticsAccount = {
  id: string;
  name: string;
  surname: string;
  email?: string;
  confirmed?: boolean;
  expired?: boolean;
  imgUrl?: string;
  assignedBusinesses: { id: string; name: string; address: string }[];
  totalBusinesses: number;
  createdAt: string;
};

export type LogisticsResponse = {
  logistics: LogisticsAccount[];
  pagination: Pagination;
};

export type RaiderListItem = {
  id: string;
  relationId?: string;
  name: string;
  surname: string;
  vehicle: Vehicle;
  isActive: boolean;
  inService?: boolean;
  confirmedFromBusiness?: boolean;
  email?: string;
  confirmed?: boolean;
  expired?: boolean;
  imgUrl?: string;
  businesses?: { id: string; name: string }[];
  totalBusinesses?: number;
  currentAssignments?: number;
  createdAt: string;
};

export type RaidersResponse = {
  raiders: RaiderListItem[];
  pagination?: Pagination;
};

export type UserAccount = {
  id: string;
  email: string;
  role: "ADMIN" | "USER" | "LOGISTICS" | "BUSINESS" | "RAIDER";
  confirmed: boolean;
  expired: boolean;
  creatdeAt: string;
  raiderProfiles: { id: string; name: string; surname: string }[];
  businessProfiles: { id: string; bussinesName: string }[];
};

export type UsersResponse = {
  users: UserAccount[];
  pagination: Pagination;
};

// Dettaglio: oggetti Prisma "grezzi" (non rimappati come nelle liste), quindi
// tipizzati in modo permissivo su ciò che effettivamente usiamo in UI.
export type BusinessDetail = {
  id: string;
  bussinesName: string;
  address: string;
  businessCord: string | null;
  raiderActived: string[];
  createdAt: string;
  user?: { email: string; confirmed: boolean; expired: boolean } | null;
  raiderRelations: {
    confirmedFromBusiness: boolean;
    raider: {
      id: string;
      name: string;
      surname: string;
      vehicle: Vehicle;
      isActive: boolean;
      user?: { email: string } | null;
    };
  }[];
  deliveries: Delivery[];
  logisticsRelations: {
    logistics: { id: string; name: string; surname: string; user?: { email: string } | null };
  }[];
};

export type RaiderDetail = {
  id: string;
  name: string;
  surname: string;
  vehicle: Vehicle;
  mobile: string | null;
  isActive: boolean;
  inService?: boolean;
  createdAt: string;
  user?: { email: string; confirmed: boolean; expired: boolean } | null;
  businessRelations: {
    business: { id: string; bussinesName: string; address: string };
  }[];
  assignedDeliveries: {
    delivery: {
      id: string;
      orderId: string | null;
      status: DeliveryStatus;
      schedulingDelivery: string;
      business: { bussinesName: string } | null;
    };
  }[];
  historyDeliveries: { deliveryId: string }[];
};

export type LogisticsDetail = {
  id: string;
  name: string;
  surname: string;
  createdAt: string;
  user?: { email: string; confirmed: boolean; expired: boolean } | null;
  businessRelations: {
    business: {
      id: string;
      bussinesName: string;
      address: string;
      deliveries: { status: DeliveryStatus }[];
    };
  }[];
};

export type BusinessProfile = {
  user: { id: string; email: string; role: string };
  business: {
    id: string;
    name: string;
    address: string;
    coordinates: string | null;
    raiderActived: string[];
    createdAt: string;
  };
};

export type LogisticsProfile = {
  id: string;
  name: string;
  surname: string;
  email?: string;
  confirmed?: boolean;
  expired?: boolean;
  businesses: { id: string; name: string; address: string; assignedAt: string }[];
  totalBusinesses: number;
  createdAt: string;
};

type Financial = {
  totalRevenue: string;
  totalCompensation: string;
  completedCompensation?: string;
  netProfit: string;
};

export type AdminStats = {
  overview: {
    totalUsers: number;
    totalBusinesses: number;
    totalLogistics: number;
    totalRaiders: number;
    activeRaiders: number;
  };
  deliveries: {
    total: number;
    byStatus: {
      created: number;
      assigned: number;
      onDelivery: number;
      completed: number;
      notDelivered: number;
    };
  };
  financial: Financial;
  topBusinesses: {
    id: string;
    name: string;
    totalOrders: number;
    completedOrders: number;
    totalCompensation: number;
  }[];
  topRaiders: {
    id: string;
    name: string;
    completedDeliveries: number;
    totalAssigned: number;
    notDelivered: number;
    compensation: string;
    successRate: string;
  }[];
};

export type LogisticsStats = {
  overview: {
    totalBusinesses: number;
    totalRaiders: number;
    activeRaiders: number;
    totalDeliveries: number;
    completedDeliveries: number;
    ongoingDeliveries: number;
  };
  deliveries: {
    total: number;
    byStatus: {
      created: number;
      assigned: number;
      onDelivery: number;
      completed: number;
      notDelivered: number;
    };
  };
  financial: Financial;
  businesses: {
    id: string;
    name: string;
    totalOrders: number;
    completedOrders: number;
    totalCompensation: number;
  }[];
  raiders: {
    raiderId: string;
    raiderName: string;
    totalAssigned: number;
    completed: number;
    notDelivered: number;
    compensation: string;
    successRate: string;
  }[];
};

export type BusinessStats = {
  orders: {
    total: number;
    byStatus: {
      created: number;
      assigned: number;
      onDelivery: number;
      completed: number;
      notDelivered: number;
      cancelled: number;
    };
  };
  financial: Financial;
  raiders: {
    total: number;
    performance: {
      raiderId: string;
      raiderName: string;
      totalAssigned: number;
      completed: number;
      notDelivered: number;
      compensation: string;
      successRate: string;
    }[];
  };
};
