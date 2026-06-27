'use client';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'technician' | 'customer';
}

export interface Device {
  id: string;
  customerName: string;
  phone: string;
  customerEmail?: string;
  deviceType: string;
  problem: string;
  status: 'pending' | 'in-progress' | 'completed' | 'hold';
  technicianId?: string;
  technicianName?: string;
  cost: number;
  date: string;
  notes: string;
  updates?: DeviceUpdate[];
}

export interface DeviceUpdate {
  status: string;
  notes: string;
  updatedBy: string;
  updatedByRole: 'admin' | 'technician';
  createdAt: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  password?: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'technician' | 'customer';
  technicianId?: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  date: string;
}

const USERS_KEY = 'users';
const DEVICES_KEY = 'devices';
const TECHNICIANS_KEY = 'technicians';
const CURRENT_USER_KEY = 'currentUser';
const NOTIFICATIONS_KEY = 'notifications';

// Default data initialization
const DEFAULT_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@gmail.com',
    password: '123456',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Technician User',
    email: 'tech@gmail.com',
    password: '123456',
    role: 'technician',
  },
];

const DEFAULT_TECHNICIANS: Technician[] = [
  { id: '1', name: 'John Smith', email: 'john@repair.com', phone: '+1234567890', specialization: 'Mobile Repairs' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@repair.com', phone: '+0987654321', specialization: 'Laptop Repairs' },
  { id: '3', name: 'Mike Wilson', email: 'mike@repair.com', phone: '+1122334455', specialization: 'Data Recovery' },
];

const DEFAULT_DEVICES: Device[] = [
  {
    id: '1',
    customerName: 'Alice Brown',
    phone: '+1234567890',
    deviceType: 'iPhone',
    problem: 'Screen replacement needed',
    status: 'pending',
    technicianId: '1',
    cost: 150,
    date: '2025-04-07',
    notes: 'Cracked screen, customer needs it by Friday',
  },
  {
    id: '2',
    customerName: 'Bob Davis',
    phone: '+0987654321',
    deviceType: 'Samsung Galaxy',
    problem: 'Battery not charging',
    status: 'in-progress',
    technicianId: '2',
    cost: 80,
    date: '2025-04-06',
    notes: 'Replaced charging port',
  },
  {
    id: '3',
    customerName: 'Carol White',
    phone: '+1122334455',
    deviceType: 'iPad',
    problem: 'Software issue',
    status: 'completed',
    technicianId: '1',
    cost: 50,
    date: '2025-04-05',
    notes: 'Reinstalled iOS',
  },
];

// Initialize localStorage on first load
export function initializeLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  }

  if (!localStorage.getItem(TECHNICIANS_KEY)) {
    localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(DEFAULT_TECHNICIANS));
  }

  if (!localStorage.getItem(DEVICES_KEY)) {
    localStorage.setItem(DEVICES_KEY, JSON.stringify(DEFAULT_DEVICES));
  }
}

// User operations
export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
}

export function saveUsers(users: User[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function updateUser(id: string, updates: Partial<User>) {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
    
    // Auto-update currentUser if it's the same
    const currentUser = getCurrentUser();
    if (currentUser?.id === id) {
      setCurrentUser({
        ...currentUser,
        name: updates.name || currentUser.name,
        email: updates.email || currentUser.email,
        role: updates.role || currentUser.role
      });
    }

    // Also sync to technicians if this user is a technician
    if (users[index].role === 'technician') {
       const techs = getTechnicians();
       const tIdx = techs.findIndex(t => t.email === users[index].email || t.id === id);
       if (tIdx !== -1) {
          if (updates.name) techs[tIdx].name = updates.name;
          if (updates.email) techs[tIdx].email = updates.email;
          if (updates.password) techs[tIdx].password = updates.password;
          saveTechnicians(techs);
       }
    }
    return users[index];
  }
  return null;
}

// Device operations
export function getDevices(): Device[] {
  if (typeof window === 'undefined') return [];
  const devices = localStorage.getItem(DEVICES_KEY);
  return devices ? JSON.parse(devices) : [];
}

export function saveDevices(devices: Device[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
}

export function addDevice(device: Omit<Device, 'id'>) {
  const devices = getDevices();
  const newDevice: Device = {
    ...device,
    id: Date.now().toString(),
  };
  devices.push(newDevice);
  saveDevices(devices);
  return newDevice;
}

export function updateDevice(id: string, updates: Partial<Device>) {
  const devices = getDevices();
  const index = devices.findIndex((d) => d.id === id);
  if (index !== -1) {
    devices[index] = { ...devices[index], ...updates };
    saveDevices(devices);
    return devices[index];
  }
  return null;
}

export function deleteDevice(id: string) {
  const devices = getDevices();
  const filtered = devices.filter((d) => d.id !== id);
  saveDevices(filtered);
}

// Technician operations
export function getTechnicians(): Technician[] {
  if (typeof window === 'undefined') return [];
  const technicians = localStorage.getItem(TECHNICIANS_KEY);
  return technicians ? JSON.parse(technicians) : [];
}

export function saveTechnicians(technicians: Technician[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(technicians));
}

export function addTechnician(technician: Omit<Technician, 'id'>) {
  const technicians = getTechnicians();
  const id = Date.now().toString();
  const newTechnician: Technician = {
    ...technician,
    id,
  };
  technicians.push(newTechnician);
  saveTechnicians(technicians);

  // Sync to users so they can log in
  const users = getUsers();
  users.push({
    id,
    name: newTechnician.name,
    email: newTechnician.email,
    password: newTechnician.password || '123456',
    role: 'technician'
  });
  saveUsers(users);

  return newTechnician;
}

export function updateTechnician(id: string, updates: Partial<Technician>) {
  const technicians = getTechnicians();
  const index = technicians.findIndex((t) => t.id === id);
  if (index !== -1) {
    const oldEmail = technicians[index].email;
    technicians[index] = { ...technicians[index], ...updates };
    saveTechnicians(technicians);

    // Sync to users
    const users = getUsers();
    const userIndex = users.findIndex((u) => u.email === oldEmail && u.role === 'technician');
    if (userIndex !== -1) {
      if (updates.name) users[userIndex].name = updates.name;
      if (updates.email) users[userIndex].email = updates.email;
      if (updates.password) users[userIndex].password = updates.password;
      saveUsers(users);
    }

    return technicians[index];
  }
  return null;
}

export function deleteTechnician(id: string) {
  const technicians = getTechnicians();
  const index = technicians.findIndex((t) => t.id === id);
  if (index !== -1) {
    const emailToDelete = technicians[index].email;
    const filtered = technicians.filter((t) => t.id !== id);
    saveTechnicians(filtered);

    // Sync to users
    const users = getUsers();
    saveUsers(users.filter(u => !(u.email === emailToDelete && u.role === 'technician')));
  }
}

// Current user operations
export function getCurrentUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user: CurrentUser | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// Notification operations
export function getNotifications(userId: string): Notification[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(NOTIFICATIONS_KEY);
  const allNotifications: Notification[] = raw ? JSON.parse(raw) : [];
  return allNotifications.filter(n => n.userId === userId || n.userId === 'all').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function saveNotifications(notifications: Notification[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export function addNotification(notification: Omit<Notification, 'id' | 'date' | 'isRead'>) {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(NOTIFICATIONS_KEY);
  const allNotifications: Notification[] = raw ? JSON.parse(raw) : [];
  
  const newNotif: Notification = {
    ...notification,
    id: Date.now().toString(),
    isRead: false,
    date: new Date().toISOString()
  };
  
  allNotifications.push(newNotif);
  saveNotifications(allNotifications);
  return newNotif;
}

export function markNotificationAsRead(id: string) {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(NOTIFICATIONS_KEY);
  const allNotifications: Notification[] = raw ? JSON.parse(raw) : [];
  
  const index = allNotifications.findIndex(n => n.id === id);
  if (index !== -1) {
    allNotifications[index].isRead = true;
    saveNotifications(allNotifications);
  }
}

export function clearNotifications(userId: string) {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(NOTIFICATIONS_KEY);
  const allNotifications: Notification[] = raw ? JSON.parse(raw) : [];
  
  saveNotifications(allNotifications.filter(n => n.userId !== userId && n.userId !== 'all'));
}
