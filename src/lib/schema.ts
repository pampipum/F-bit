// src/lib/schema.ts
import { z } from 'zod';

export const formSchema = z.object({
	btcStart: z.number().min(0),
	retirementDate: z.string(), // Adjust validation as needed
	incomeAfterTaxes: z.number().min(0)
	// Since monthlyExpenses is calculated, you might not need it in the form schema
});

export type FormSchema = z.infer<typeof formSchema>;
