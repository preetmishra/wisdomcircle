import Logo from "../assets/Logo";
import Separator from "../assets/Separator";
import Turtle from "../assets/Turtle";

export default function WelcomeScreen() {
  return (
    <div className="hidden md:flex flex-col h-full bg-neutral-grey md:basis-2/5 text-white p-6">
      <div className="w-full flex justify-center h-full items-center">
        <Logo className="w-44 h-44 lg:w-56 lg:h-56" />
      </div>
      <div className="flex flex-row space-x-4">
        <Turtle className="w-40 h-56 flex-shrink-0 self-end -mb-6 -ml-4" />
        <div>
          <div className="space-y-3">
            <p className="text-2xl font-bold">Welcome back!</p>
            <p>
              Sign In to find opportunities that match your interests. We have
              both part-time and full-time roles that can be done online and
              in-person.
            </p>
          </div>
          <Separator className="w-7 h-1 mt-12" />
          <p className="text-xs mt-16">
            Please contact us at
            <span className="mx-1 font-semibold">+91-9380644532</span>
            if you need any assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
