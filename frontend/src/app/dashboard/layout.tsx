"use server";
import { redirect } from "next/navigation";
import React from "react";
import NavHeader from "~/components/NavHeader";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session || !session?.user?.id) {
    // redirect to login
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      credits: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    redirect("/login");
  }
  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto flex-1 py-6">
        <NavHeader credits={user?.credits || 0} email={user?.email || ""} />
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
