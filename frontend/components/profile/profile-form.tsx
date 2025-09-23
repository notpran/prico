"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserResource } from "@clerk/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(20, { message: "Username must not be longer than 20 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only include letters, numbers, and underscores.",
    }),
  displayName: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters." })
    .max(50, { message: "Display name must not be longer than 50 characters." }),
  bio: z
    .string()
    .max(500, { message: "Bio must not be longer than 500 characters." })
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  user: any; // Using any temporarily to resolve the type mismatch
  initialData: {
    username: string;
    displayName: string;
    bio: string;
  };
}

export default function ProfileForm({ user, initialData }: ProfileFormProps) {
  const { user: clerkUser } = useClerk();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: initialData.username,
      displayName: initialData.displayName,
      bio: initialData.bio || "",
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsSubmitting(true);
      
      // Update Clerk user data
      await clerkUser?.update({
        username: data.username,
        firstName: data.displayName.split(" ")[0] || "",
        lastName: data.displayName.split(" ").slice(1).join(" ") || "",
      });
      
      // Update user public metadata for the bio
      await clerkUser?.update({
        publicMetadata: {
          ...user.publicMetadata,
          about: data.bio,
        },
      });
      
      // Also update our backend database (if needed)
      try {
        const token = await clerkUser?.getToken();
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: data.username,
            display_name: data.displayName,
            about_me: data.bio,
          }),
        });
      } catch (error) {
        console.error("Error updating backend database", error);
        // Continue anyway as Clerk is the primary source of truth
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      router.push("/profile");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public username. It can only contain letters, numbers, and underscores.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="Display Name" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a bit about yourself"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Brief description for your profile. Max 500 characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/profile")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}