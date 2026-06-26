import useAuthStore from '../store/authStore';

function TutorProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-neutral-900">Tutor Profile</h1>
        <p className="text-neutral-600 mt-1">Manage your tutoring profile</p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Introduction</h2>
        <textarea
          className="input min-h-[150px]"
          placeholder="Tell students about yourself, your teaching style, and what makes you a great tutor..."
        />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Subjects</h2>
        <p className="text-neutral-600 mb-4">Select the subjects you can teach</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {['Mathematics', 'English', 'Science', 'Programming', 'Spanish', 'French'].map((subject) => (
            <label key={subject} className="flex items-center gap-2 p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm">{subject}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Hourly Rate</h2>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold">$</span>
          <input type="number" defaultValue="30" className="input w-32" />
          <span className="text-neutral-500">/hour</span>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Availability</h2>
        <p className="text-neutral-600 mb-4">Set your available hours</p>
        <div className="space-y-3">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
            <div key={day} className="flex items-center gap-4">
              <span className="w-24 text-sm font-medium">{day}</span>
              <input type="time" className="input w-32" />
              <span className="text-neutral-400">to</span>
              <input type="time" className="input w-32" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button className="btn-primary">Save Profile</button>
        <button className="btn-secondary">Preview Profile</button>
      </div>
    </div>
  );
}

export default TutorProfilePage;
