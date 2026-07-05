/** Rebuild FormData so it can be forwarded from a Route Handler to the API. */
export async function rebuildFormData(source: FormData): Promise<FormData> {
  const rebuilt = new FormData();

  for (const [key, value] of source.entries()) {
    if (typeof value === "string") {
      rebuilt.append(key, value);
      continue;
    }

    const bytes = await value.arrayBuffer();
    rebuilt.append(
      key,
      new Blob([bytes], { type: value.type || "application/octet-stream" }),
      value.name || "upload"
    );
  }

  return rebuilt;
}
