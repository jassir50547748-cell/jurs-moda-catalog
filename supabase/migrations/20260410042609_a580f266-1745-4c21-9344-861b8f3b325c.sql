-- Add tiered pricing to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS price_media_docena numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS price_docena numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS price_mayoreo numeric DEFAULT NULL;

-- Migrate existing price to price_docena if set
UPDATE public.products SET price_docena = price WHERE price IS NOT NULL AND price_docena IS NULL;

-- Create product_images table for multiple photos
CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  color text DEFAULT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view images of active products"
  ON public.product_images FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_images.product_id AND p.active = true));

CREATE POLICY "Admins can view all images"
  ON public.product_images FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert images"
  ON public.product_images FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update images"
  ON public.product_images FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete images"
  ON public.product_images FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
