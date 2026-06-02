#!/usr/bin/env python3
"""
FAISS Export Script for ezLegal.ai Migration

Run this script on the legacy Python chatbot server (52.35.244.130) to export
FAISS embeddings and metadata for migration to pgvector.

Usage:
    python3 export-faiss.py --index-path /var/www/chatbot/indexes --output ./faiss-export

Requirements:
    pip install faiss-cpu numpy
"""

import argparse
import json
import os
import sys
from pathlib import Path

try:
    import faiss
    import numpy as np
except ImportError:
    print("Error: Required packages not found.")
    print("Install with: pip install faiss-cpu numpy")
    sys.exit(1)


def load_faiss_index(index_path: str) -> tuple:
    """Load FAISS index and associated metadata."""

    index_file = Path(index_path) / "index.faiss"
    metadata_file = Path(index_path) / "index.pkl"
    docstore_file = Path(index_path) / "docstore.json"

    if not index_file.exists():
        for ext in [".index", ".bin", ""]:
            alt_file = Path(index_path) / f"faiss_index{ext}"
            if alt_file.exists():
                index_file = alt_file
                break

    if not index_file.exists():
        raise FileNotFoundError(f"FAISS index not found in {index_path}")

    print(f"Loading FAISS index from: {index_file}")
    index = faiss.read_index(str(index_file))

    metadata = []

    if metadata_file.exists():
        import pickle
        with open(metadata_file, 'rb') as f:
            metadata = pickle.load(f)
        print(f"Loaded metadata from pickle: {len(metadata)} entries")
    elif docstore_file.exists():
        with open(docstore_file, 'r') as f:
            docstore = json.load(f)
        metadata = list(docstore.values()) if isinstance(docstore, dict) else docstore
        print(f"Loaded metadata from JSON: {len(metadata)} entries")
    else:
        txt_files = list(Path(index_path).glob("*.txt"))
        if txt_files:
            for txt_file in txt_files:
                with open(txt_file, 'r') as f:
                    content = f.read()
                metadata.append({
                    'title': txt_file.stem,
                    'content': content,
                    'source': str(txt_file)
                })
            print(f"Loaded metadata from text files: {len(metadata)} entries")

    return index, metadata


def extract_embeddings(index: faiss.Index) -> list:
    """Extract all embeddings from FAISS index."""

    n_vectors = index.ntotal
    dimension = index.d

    print(f"Extracting {n_vectors} vectors of dimension {dimension}")

    embeddings = []

    if hasattr(index, 'reconstruct'):
        for i in range(n_vectors):
            try:
                vector = index.reconstruct(i)
                embeddings.append(vector.tolist())
            except Exception as e:
                print(f"Warning: Could not reconstruct vector {i}: {e}")
                embeddings.append([0.0] * dimension)
    else:
        print("Warning: Index does not support reconstruction.")
        print("Embeddings will need to be regenerated using OpenAI API.")
        embeddings = [[0.0] * dimension] * n_vectors

    return embeddings


def export_for_pgvector(output_dir: str, metadata: list, embeddings: list):
    """Export data in format ready for pgvector import."""

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    metadata_cleaned = []
    for i, item in enumerate(metadata):
        if isinstance(item, dict):
            cleaned = {
                'id': i,
                'title': item.get('title', item.get('name', f'Document {i}')),
                'content': item.get('content', item.get('text', item.get('page_content', ''))),
                'source': item.get('source', item.get('url', None)),
                'type': item.get('type', item.get('document_type', 'legacy')),
                'jurisdiction': item.get('jurisdiction', 'general'),
                'practice_area': item.get('practice_area', item.get('category', 'general')),
            }
        else:
            cleaned = {
                'id': i,
                'title': f'Document {i}',
                'content': str(item),
                'source': None,
                'type': 'legacy',
                'jurisdiction': 'general',
                'practice_area': 'general',
            }
        metadata_cleaned.append(cleaned)

    metadata_file = output_path / "metadata.json"
    with open(metadata_file, 'w') as f:
        json.dump(metadata_cleaned, f, indent=2)
    print(f"Exported metadata to: {metadata_file}")

    embeddings_file = output_path / "embeddings.json"
    with open(embeddings_file, 'w') as f:
        json.dump(embeddings, f)
    print(f"Exported embeddings to: {embeddings_file}")

    manifest = {
        'export_date': str(np.datetime64('now')),
        'total_vectors': len(embeddings),
        'dimension': len(embeddings[0]) if embeddings else 0,
        'metadata_count': len(metadata_cleaned),
        'source_index': str(Path(args.index_path).absolute()),
        'notes': 'Export from legacy FAISS for pgvector migration'
    }

    manifest_file = output_path / "manifest.json"
    with open(manifest_file, 'w') as f:
        json.dump(manifest, f, indent=2)
    print(f"Exported manifest to: {manifest_file}")

    print(f"\n✓ Export complete! Copy {output_dir} to migration-toolkit/backups/faiss-export/")


def main():
    global args
    parser = argparse.ArgumentParser(
        description='Export FAISS index for pgvector migration'
    )
    parser.add_argument(
        '--index-path',
        required=True,
        help='Path to FAISS index directory'
    )
    parser.add_argument(
        '--output',
        default='./faiss-export',
        help='Output directory for exported data'
    )

    args = parser.parse_args()

    print("\n" + "=" * 50)
    print("  FAISS Export for ezLegal.ai Migration")
    print("=" * 50 + "\n")

    try:
        index, metadata = load_faiss_index(args.index_path)
        embeddings = extract_embeddings(index)

        if len(metadata) != len(embeddings):
            print(f"\nWarning: Metadata count ({len(metadata)}) != embedding count ({len(embeddings)})")
            min_count = min(len(metadata), len(embeddings))
            metadata = metadata[:min_count]
            embeddings = embeddings[:min_count]
            print(f"Truncated to {min_count} entries")

        export_for_pgvector(args.output, metadata, embeddings)

    except Exception as e:
        print(f"\n✗ Export failed: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
