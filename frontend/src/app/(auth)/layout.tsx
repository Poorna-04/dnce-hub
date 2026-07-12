export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(to right, #000000, #1a1a1a, #000000)",
      }}
    >
      {children}
    </div>
  );
}
