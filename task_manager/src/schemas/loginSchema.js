import {z} from "zod"

export const loginSchema = z.object({
    username:z.string().min(1,"user name is required"),
    password:z.string().min(6,"password must be atleast 6 characters"),
});