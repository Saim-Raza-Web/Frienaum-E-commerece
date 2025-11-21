import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the default language (German)
  redirect('/de');
  
  return null;
}
