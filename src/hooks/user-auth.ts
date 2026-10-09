import { authService } from "@/services/auth.services";
import { SignUpDto } from "@/types/api.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type AuthToastMessages = {
  success?: string;
  error?: string;
};

export const useSignUp = (
  messages?: AuthToastMessages & { verifyEmail?: string },
) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignUpDto) => authService.signUp(data),

    onSuccess: (response) => {
      queryClient.setQueryData(["auth", "session"], {
        user: response.user,
        isGuest: false,
        isAuthenticated: true,
      });

      if (response.token) {
        toast.success(messages?.success ?? "Account created successfully!");

        router.push("/product/catalog");
        return;
      }

      toast.info(
        messages?.verifyEmail ??
          messages?.success ??
          "Account created! Please check email your to verify account",
      );

      router.push("/auth/signin");
    },

    onError: (error: unknown) => {
      const message = (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      )?.response?.data?.message;

      toast.error(
        typeof message === "string"
          ? message
          : (messages?.error ?? "Sign up failed"),
      );
    },
  });
};
