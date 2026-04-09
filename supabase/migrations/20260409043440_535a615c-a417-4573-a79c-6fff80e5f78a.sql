
-- Add new categories to enum
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'busos';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'poleras';

-- Add sold_out flag to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sold_out boolean NOT NULL DEFAULT false;

-- Create product_variants table for color/size stock management
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color text NOT NULL,
  size text,
  in_stock boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Public can view variants of active products
CREATE POLICY "Anyone can view variants of active products"
ON public.product_variants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_variants.product_id AND p.active = true
  )
);

-- Admins can view all variants
CREATE POLICY "Admins can view all variants"
ON public.product_variants
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert variants
CREATE POLICY "Admins can insert variants"
ON public.product_variants
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update variants
CREATE POLICY "Admins can update variants"
ON public.product_variants
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete variants
CREATE POLICY "Admins can delete variants"
ON public.product_variants
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Index for fast lookups
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
