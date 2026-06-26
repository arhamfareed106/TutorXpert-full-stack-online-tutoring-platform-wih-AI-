import useAuthStore from '../store/authStore';

function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-neutral-900">Settings</h1>
        <p className="text-neutral-600 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Section */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <img
            src={user?.profilePic || `https://i.pravatar.cc/100?u=${user?.userId}`}
            alt={user?.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <button className="btn-secondary btn-sm">Change Photo</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="input-label">Name</label>
            <input type="text" defaultValue={user?.name} className="input" />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input type="email" defaultValue={user?.email} className="input" disabled />
          </div>
          <button className="btn-primary">Save Changes</button>
        </div>
      </div>

      {/* Password Section */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Password</h2>
        <div className="space-y-4">
          <div>
            <label className="input-label">Current Password</label>
            <input type="password" className="input" />
          </div>
          <div>
            <label className="input-label">New Password</label>
            <input type="password" className="input" />
          </div>
          <button className="btn-primary">Change Password</button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Notifications</h2>
        <div className="space-y-4">
          {['Email notifications', 'Push notifications', 'SMS notifications'].map((item) => (
            <label key={item} className="flex items-center justify-between">
              <span className="text-neutral-700">{item}</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
