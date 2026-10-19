"use client";

import { slugify } from "@ligatracker/domain";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createLeagueAction, type CreateLeagueState } from "./actions";

export function CreateLeagueForm() {
  const [state, action, pending] = useActionState<CreateLeagueState, FormData>(createLeagueAction, {});
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};

  // Tras crear la liga el formulario se vacía; el slug (controlado) también.
  useEffect(() => {
    if (state.created) {
      setSlug("");
      setSlugEdited(false);
    }
  }, [state.created]);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Input
        label="Nombre comercial"
        name="name"
        required
        defaultValue={v.name}
        error={err.name}
        onChange={(e) => !slugEdited && setSlug(slugify(e.target.value))}
      />
      <Input
        label="Slug (URL)"
        name="slug"
        required
        value={slug}
        error={err.slug}
        onChange={(e) => {
          setSlugEdited(true);
          setSlug(e.target.value);
        }}
      />
      <Input label="Nombre del administrador" name="adminFirstName" required defaultValue={v.adminFirstName} error={err.adminFirstName} />
      <Input label="Apellido del administrador" name="adminLastName" required defaultValue={v.adminLastName} error={err.adminLastName} />
      <Input label="Email del administrador" name="adminEmail" type="email" required defaultValue={v.adminEmail} error={err.adminEmail} />
      <Input
        label="Contraseña inicial"
        name="adminPassword"
        type="password"
        autoComplete="new-password"
        required
        error={err.adminPassword}
      />
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creando…" : "Crear liga"}
        </Button>
        {state.created ? (
          <p className="text-xs text-success">
            Liga «{state.created.name}» creada en /panel/{state.created.slug}
          </p>
        ) : null}
      </div>
    </form>
  );
}
