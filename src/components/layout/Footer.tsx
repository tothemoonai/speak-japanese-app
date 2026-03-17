export function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; 2026 IT日语. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/settings" className="hover:text-foreground transition-colors">
              设置
            </a>
            <a href="/help" className="hover:text-foreground transition-colors">
              帮助
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
