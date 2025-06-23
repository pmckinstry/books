import AuthGuard from '@/components/AuthGuard';
import ProfileForm from '@/components/ProfileForm';

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileForm />
    </AuthGuard>
  );
} 