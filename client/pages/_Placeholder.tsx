import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Placeholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center animate-fade-up">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-3 text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button asChild>
          <Link to="/admin">Open Admin Dashboard</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
