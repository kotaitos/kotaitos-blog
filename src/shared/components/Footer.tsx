export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <p className="text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} kotaitos. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
