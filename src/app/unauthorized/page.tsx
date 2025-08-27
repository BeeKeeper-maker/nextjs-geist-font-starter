"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

export default function UnauthorizedPage() {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">
            অ্যাক্সেস নিষিদ্ধ
          </CardTitle>
          <CardDescription className="text-gray-600">
            আপনার এই পেজে প্রবেশের অনুমতি নেই
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-500">
            <p>দুঃখিত, আপনার বর্তমান ভূমিকায় এই বিভাগে প্রবেশের অনুমতি নেই।</p>
            <p>অনুগ্রহ করে আপনার অ্যাডমিনিস্ট্রেটরের সাথে যোগাযোগ করুন।</p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              পূর্ববর্তী পেজে ফিরে যান
            </Button>
            <Button onClick={handleSignOut} variant="destructive" className="w-full">
              লগ আউট করুন
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
