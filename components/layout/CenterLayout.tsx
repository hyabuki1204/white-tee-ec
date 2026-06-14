type CenterLayoutProps = {
  children: React.ReactNode;
};

export function CenterLayout({ children }: CenterLayoutProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 md:py-32">
      {children}
    </div>
  );
}
