def recursive_chunk_text(
    text: str,
    chunk_size: int = 800,
    chunk_overlap: int = 150,
) -> list[str]:
    if not text.strip():
        return []

    separators = ["\n\n", "\n", ". ", " ", ""]
    chunks: list[str] = []

    def split_recursive(content: str, sep_index: int) -> list[str]:
        if len(content) <= chunk_size:
            return [content.strip()] if content.strip() else []

        if sep_index >= len(separators):
            parts = [content[i : i + chunk_size] for i in range(0, len(content), chunk_size - chunk_overlap)]
            return [p.strip() for p in parts if p.strip()]

        sep = separators[sep_index]
        if not sep:
            parts = [content[i : i + chunk_size] for i in range(0, len(content), chunk_size - chunk_overlap)]
            return [p.strip() for p in parts if p.strip()]

        splits = content.split(sep)
        result: list[str] = []
        current = ""

        for i, piece in enumerate(splits):
            candidate = piece if not current else current + sep + piece
            if len(candidate) <= chunk_size:
                current = candidate
            else:
                if current:
                    result.extend(split_recursive(current, sep_index + 1))
                current = piece

        if current:
            result.extend(split_recursive(current, sep_index + 1))

        return result

    raw_chunks = split_recursive(text, 0)
    merged: list[str] = []
    for chunk in raw_chunks:
        if merged and len(merged[-1]) < chunk_overlap and len(merged[-1]) + len(chunk) <= chunk_size + chunk_overlap:
            merged[-1] = merged[-1] + " " + chunk
        else:
            merged.append(chunk)

    return [c for c in merged if len(c) > 30]
