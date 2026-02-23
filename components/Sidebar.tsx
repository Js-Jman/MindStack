import React from "react";

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <div className="text-xs font-bold text-purple-600 uppercase mb-1 tracking-wider">
        {title}
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function SidebarLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition-colors"
    >
      {children}
    </a>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white/80 border border-purple-100 rounded-2xl shadow-lg p-6 flex flex-col gap-2 sticky top-24 h-fit self-start">
      <nav className="flex flex-col gap-2">
        <SidebarSection title="Dashboard">
          <SidebarLink href="/courses">
            Overview of enrolled courses
          </SidebarLink>
          <SidebarLink href="/student">Progress summary</SidebarLink>
        </SidebarSection>
        <SidebarSection title="My Courses">
          <SidebarLink href="/courses">Courses</SidebarLink>
        </SidebarSection>
        <SidebarSection title="Assignments">
          <SidebarLink href="/dashboard/assignments/due">Due tasks</SidebarLink>
          <SidebarLink href="/dashboard/assignments/submissions">
            Submission status
          </SidebarLink>
        </SidebarSection>
        <SidebarSection title="Quizzes / Exams">
          <SidebarLink href="/student">
            Upcoming tests
          </SidebarLink>
          <SidebarLink href="/student">Results</SidebarLink>
        </SidebarSection>
        <SidebarSection title="Certificates">
          <SidebarLink href="/dashboard/certificates/download">
            Downloadable certificates
          </SidebarLink>
          
        </SidebarSection>
        <SidebarSection title="Messages / Inbox">
          <SidebarLink href="/dashboard/messages">
            Instructor communication
          </SidebarLink>
        </SidebarSection>
        <SidebarSection title="Profile / Settings">
          <SidebarLink href="/profile">Account details</SidebarLink>
          <SidebarLink href="/profile">
            Password
          </SidebarLink>
        </SidebarSection>
      </nav>
    </aside>
  );
}
