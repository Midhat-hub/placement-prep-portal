import { FormEvent, useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Save } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { auth, db } from "../../services/firebase/client";

type Profile = {
  name: string;
  year: string;
  branch: string;
  instituteRollNumber: string;
};

const emptyProfile: Profile = { name: "", year: "", branch: "", instituteRollNumber: "" };

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const snapshot = await getDoc(doc(db, "user_progress", user.uid, "profile", "details"));
        if (snapshot.exists()) {
          const saved = snapshot.data();
          setProfile({
            name: String(saved.name || ""),
            year: String(saved.year || ""),
            branch: String(saved.branch || ""),
            instituteRollNumber: String(saved.instituteRollNumber || ""),
          });
        }
      } catch {
        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!profile.name.trim() || !profile.year || !profile.branch.trim()) {
      setError("Please complete all profile fields.");
      return;
    }
    if (!/^\d{7}$/.test(profile.instituteRollNumber)) {
      setError("Institute roll number must contain exactly 7 digits.");
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      setError("Your session has expired. Please sign in again.");
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, "user_progress", user.uid, "profile", "details"), {
        ...profile,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setMessage("Profile saved successfully.");
    } catch {
      setError("Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return <><PageHeader eyebrow="YOUR PROFILE" title="Personalize your workspace." description="Add your academic details so your dashboard can greet you by name." /><section className="panel profile-form-panel">{loading ? <p className="muted">Loading your profile…</p> : <form className="profile-form" onSubmit={save}><div className="profile-form-grid"><label>Username<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} placeholder="Your username" required /></label><label>Year<select value={profile.year} onChange={(event) => setProfile({ ...profile, year: event.target.value })} required><option value="">Select year</option><option value="1st Year">1st Year</option><option value="2nd Year">2nd Year</option><option value="3rd Year">3rd Year</option><option value="4th Year">4th Year</option></select></label><label>Branch<select value={profile.branch} onChange={(event) => setProfile({ ...profile, branch: event.target.value })} required><option value="">Select branch</option><option value="Computer Engineering (CE)">Computer Engineering (CE)</option><option value="Computer Science and Technology (CST)">Computer Science and Technology (CST)</option><option value="Information Technology (IT)">Information Technology (IT)</option><option value="Data Science (DS)">Data Science (DS)</option><option value="Artificial Intelligence (AI)">Artificial Intelligence (AI)</option><option value="Electronics and Telecommunication (ENC)">Electronics and Telecommunication (ENC)</option></select></label><label>Institute roll number<input value={profile.instituteRollNumber} onChange={(event) => setProfile({ ...profile, instituteRollNumber: event.target.value.replace(/\D/g, "").slice(0, 7) })} inputMode="numeric" pattern="\d{7}" placeholder="7-digit roll number" required /><small>Enter exactly 7 digits.</small></label></div>{error && <div className="alert error">{error}</div>}{message && <div className="alert success">{message}</div>}<button className="button primary" disabled={saving}><Save size={16} />{saving ? "Saving…" : "Save profile"}</button></form>}</section></>;
}
