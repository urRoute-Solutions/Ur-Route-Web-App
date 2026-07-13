"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { registerOperatorSchema, type RegisterOperatorInput } from "@/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function RegisterOperatorPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterOperatorInput>({
    resolver: zodResolver(registerOperatorSchema),
  });

  async function onSubmit(data: RegisterOperatorInput) {
    setError(null);
    const res = await fetch("/api/auth/register-operator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error?.message ?? "Registration failed"); return; }
    router.push("/operator/dashboard");
  }

  return (
    <div className="space-y-7">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">Register your fleet</h2>
        <p className="text-muted-foreground text-sm">Set up your urRoute operator account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Your name</Label>
          <Input id="fullName" {...register("fullName")} placeholder="Ada Lovelace" className="h-11" />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Account email</Label>
          <Input id="email" type="email" {...register("email")} placeholder="ada@example.com" className="h-11" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input id="phone" {...register("phone")} placeholder="+91 98765 43210" className="h-11" />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password")} placeholder="Min. 8 characters" className="h-11" />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">Company details</span>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="companyName">Company name</Label>
          <Input id="companyName" {...register("companyName")} placeholder="Sunrise Travels" className="h-11" />
          {errors.companyName && <p className="text-xs text-destructive">{errors.companyName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contactEmail">Company contact email</Label>
          <Input id="contactEmail" type="email" {...register("contactEmail")} placeholder="contact@sunrisetravels.in" className="h-11" />
          {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contactPhone">Company contact phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input id="contactPhone" {...register("contactPhone")} placeholder="+91 44 2233 4455" className="h-11" />
          {errors.contactPhone && <p className="text-xs text-destructive">{errors.contactPhone.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city">City <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input id="city" {...register("city")} placeholder="Chennai" className="h-11" />
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Address <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input id="address" {...register("address")} placeholder="Street address" className="h-11" />
          {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" variant="action" className="w-full h-11 font-semibold" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create operator account"}
        </Button>

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Your account will be created immediately with a unique URID. Route publishing unlocks once our team reviews and activates your account.
        </p>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Just want to book tickets?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Register as a traveler
        </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
