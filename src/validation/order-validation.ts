import { z } from "zod";

export class OrderValidation {
  static readonly OrderRequestCreate = z.object({
    customer_name: z
      .string({ message: "Nama pelanggan wajib diisi" })
      .min(1, { message: "Nama pelanggan tidak boleh kosong" }),

    phone_number: z
      .string({ message: "Nomor HP wajib diisi" })
      .min(8, { message: "Nomor HP minimal 8 digit" }),

    id_service: z
      .number({ message: "Layanan wajib dipilih" })
      .int({ message: "Service ID harus berupa bilangan bulat" }),

    weight_kg: z
      .number({ message: "Berat wajib diisi" })
      .int({ message: "Berat harus berupa bilangan bulat" }),

    notes: z.string({ message: "Catatan harus berupa teks" }).optional(),
  });

  static readonly OrderRequestUpdate =
    OrderValidation.OrderRequestCreate.extend({
      status_id: z
        .number({ message: "Status wajib dipilih" })
        .int({ message: "Status ID harus berupa bilangan bulat" }),
    });
}
