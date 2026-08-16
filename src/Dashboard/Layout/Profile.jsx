import { useEffect, useState } from "react";
import api from "../../Api";
import { useAuth } from "../../Context/AuthContext";
import { UserRound, Mail, Phone, Briefcase, Cake, Calendar, BadgeCheck } from "lucide-react";

const roleLabels = {
  admin: "Admin",
  "sub-admin": "Sub-Admin",
  counsellor: "Counsellor",
  teacher: "Teacher",
  logistics: "Logistics",
  followUp: "Follow-up",
  ca: "CA",
  student: "Student",
};

const Field = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="mt-0.5 text-primary">
      {Icon && <Icon className="w-5 h-5" />}
    </div>
    <div className="flex-1">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="text-gray-800 font-medium break-words">
        {value || <span className="text-gray-300">—</span>}
      </p>
    </div>
  </div>
);

const formatDate = (d) => {
  if (!d) return null;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setProfile(res.data?.data || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load profile", err);
        setError("Failed to load profile");
        setLoading(false);
      });
  }, []);

  const name = profile?.name || user?.name || "—";
  const role = profile?.role || user?.role;
  const isStudent = role === "student";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">
        My Profile
      </h1>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary px-6 py-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <UserRound className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{name}</h2>
              <p className="text-white/80 text-sm">
                {roleLabels[role] || role}
              </p>
            </div>
          </div>

          <div className="px-6 py-4">
            <Field icon={Mail} label="Email" value={profile?.email || user?.email} />

            {isStudent ? (
              <>
                <Field icon={BadgeCheck} label="Student ID" value={profile?.uuid || profile?.studentId} />
                <Field icon={Briefcase} label="Standard" value={profile?.standard} />
                <Field icon={Calendar} label="Exam Year" value={profile?.examYear} />
                <Field icon={Cake} label="Date of Birth" value={formatDate(profile?.dob)} />
                <Field
                  icon={BadgeCheck}
                  label="Amount Remaining"
                  value={profile?.amountRemaining != null ? `₹${Number(profile.amountRemaining).toLocaleString("en-IN")}` : null}
                />
              </>
            ) : (
              <>
                <Field icon={Phone} label="Contact Number" value={profile?.contactNum} />
                {profile?.counsellorBranch && (
                  <Field icon={Briefcase} label="Branch" value={profile.counsellorBranch} />
                )}
                <Field icon={Cake} label="Date of Birth" value={formatDate(profile?.dob)} />
                <Field icon={Calendar} label="Joining Date" value={formatDate(profile?.joiningDate)} />
                <Field
                  icon={BadgeCheck}
                  label="Status"
                  value={profile?.isActive ? "Active" : "Inactive"}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
