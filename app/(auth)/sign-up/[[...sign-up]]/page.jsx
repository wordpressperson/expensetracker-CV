import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <SignUp afterSignUpUrl="/dashboard" />;
}

export default function Page() {
  return <SignUp />;
}
