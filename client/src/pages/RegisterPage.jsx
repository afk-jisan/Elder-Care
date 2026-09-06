import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { homePathForRole } from '../lib/rolePaths';
import PasswordInput from '../components/PasswordInput';

const ROLES = [
  { value: 'family', label: 'Family' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'admin', label: 'Admin' },
];

const ROLE_HINTS = {
  family:
    'For family members abroad who manage care and payments for an elder in Bangladesh.',
  caregiver:
    'Caregivers must complete admin vetting before appearing in the assignment pool.',
  doctor: 'Doctors need a valid BMDC registration number for video consults.',
  admin: 'Admin accounts require an invite code from platform operations.',
};

const EMPTY_ROLE_FIELDS = {
  countryOfResidence: '',
  relationshipToElder: '',
  nidNumber: '',
  yearsExperience: '',
  serviceArea: '',
  bmdcRegistrationNo: '',
  specialization: '',
  organizationName: '',
  adminInviteCode: '',
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'family',
    ...EMPTY_ROLE_FIELDS,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateRole(role) {
    setForm((prev) => ({
      ...prev,
      role,
      ...EMPTY_ROLE_FIELDS,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
      };

      if (form.role === 'family') {
        payload.countryOfResidence = form.countryOfResidence.trim();
        payload.relationshipToElder = form.relationshipToElder.trim();
      } else if (form.role === 'caregiver') {
        payload.nidNumber = form.nidNumber.trim();
        payload.yearsExperience = Number(form.yearsExperience);
        payload.serviceArea = form.serviceArea.trim();
      } else if (form.role === 'doctor') {
        payload.bmdcRegistrationNo = form.bmdcRegistrationNo.trim();
        payload.specialization = form.specialization.trim();
      } else if (form.role === 'admin') {
        payload.organizationName = form.organizationName.trim();
        payload.adminInviteCode = form.adminInviteCode.trim();
      }

      const user = await register(payload);
      navigate(homePathForRole(user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card auth-card">
      <p className="auth-kicker muted">
        <Link to="/">Elder Care</Link>
      </p>
      <h1>Register</h1>
      <p className="auth-lead muted">Create an account for your role</p>
      <form onSubmit={handleSubmit} className="form auth-form">
        <label>
          Role
          <select value={form.role} onChange={(e) => updateRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <p className="form-hint">{ROLE_HINTS[form.role]}</p>

        <div className="form-section">
          <p className="form-section-label">Account</p>
          <label>
            Full name
            <input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              required
              placeholder="+8801XXXXXXXXX"
            />
          </label>
        </div>

        {form.role === 'family' && (
          <div className="form-section">
            <p className="form-section-label">Family details</p>
            <label>
              Country of residence
              <input
                value={form.countryOfResidence}
                onChange={(e) => updateField('countryOfResidence', e.target.value)}
                required
                placeholder="e.g. United Kingdom, USA, UAE"
              />
            </label>
            <label>
              Relationship to elder
              <input
                value={form.relationshipToElder}
                onChange={(e) => updateField('relationshipToElder', e.target.value)}
                placeholder="e.g. Daughter, Son, Niece"
              />
            </label>
          </div>
        )}

        {form.role === 'caregiver' && (
          <div className="form-section">
            <p className="form-section-label">Caregiver details</p>
            <label>
              National ID (NID) number
              <input
                value={form.nidNumber}
                onChange={(e) => updateField('nidNumber', e.target.value)}
                required
                inputMode="numeric"
                placeholder="10 or 13 digit NID"
              />
            </label>
            <label>
              Years of elderly care experience
              <input
                type="number"
                min="0"
                max="60"
                value={form.yearsExperience}
                onChange={(e) => updateField('yearsExperience', e.target.value)}
                required
              />
            </label>
            <label>
              Service area in Dhaka
              <input
                value={form.serviceArea}
                onChange={(e) => updateField('serviceArea', e.target.value)}
                required
                placeholder="e.g. Mirpur, Dhanmondi, Uttara"
              />
            </label>
          </div>
        )}

        {form.role === 'doctor' && (
          <div className="form-section">
            <p className="form-section-label">Doctor details</p>
            <label>
              BMDC registration number
              <input
                value={form.bmdcRegistrationNo}
                onChange={(e) => updateField('bmdcRegistrationNo', e.target.value)}
                required
                placeholder="e.g. A-12345"
              />
            </label>
            <label>
              Specialization
              <input
                value={form.specialization}
                onChange={(e) => updateField('specialization', e.target.value)}
                required
                placeholder="e.g. Geriatrics, Internal medicine"
              />
            </label>
          </div>
        )}

        {form.role === 'admin' && (
          <div className="form-section">
            <p className="form-section-label">Admin details</p>
            <label>
              Organization name
              <input
                value={form.organizationName}
                onChange={(e) => updateField('organizationName', e.target.value)}
                placeholder="e.g. Elder Care Operations"
              />
            </label>
            <label>
              Admin invite code
              <input
                value={form.adminInviteCode}
                onChange={(e) => updateField('adminInviteCode', e.target.value)}
                required
                autoComplete="off"
              />
            </label>
          </div>
        )}

        <div className="form-section">
          <p className="form-section-label">Security</p>
          <PasswordInput
            label="Password (min 8 characters)"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="auth-footer muted">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
