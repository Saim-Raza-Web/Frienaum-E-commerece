import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the default language (English)
  redirect('/en');
  
  return null;
}
