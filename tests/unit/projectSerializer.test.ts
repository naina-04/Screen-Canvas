import { describe, it, expect } from 'vitest';
import { ProjectSerializer } from '../../src/shared/utils/ProjectSerializer';
import { DrawingElement } from '../../src/shared/types';

describe('ProjectSerializer Utility', () => {
  const sampleElements: DrawingElement[] = [
    {
      id: 'p-1',
      type: 'pen',
      color: '#ff0000',
      strokeWidth: 4,
      opacity: 1,
      brushStyle: 'solid',
      points: [{ x: 10, y: 10 }, { x: 20, y: 20 }],
    },
  ];

  it('serializes project data to structured JSON string', () => {
    const json = ProjectSerializer.serialize(sampleElements, { activeTool: 'pen' }, 'Demo');
    expect(json).toContain('"appName": "ScreenCanvas"');
    expect(json).toContain('"formatVersion": "1.0"');
    expect(json).toContain('"title": "Demo"');
  });

  it('deserializes valid project JSON back to structured object', () => {
    const json = ProjectSerializer.serialize(sampleElements, { activeTool: 'pen' });
    const project = ProjectSerializer.deserialize(json);
    expect(project).not.toBeNull();
    expect(project?.elements.length).toBe(1);
    expect(project?.elements[0].id).toBe('p-1');
  });

  it('rejects invalid or corrupted JSON cleanly', () => {
    expect(ProjectSerializer.deserialize('invalid json')).toBeNull();
    expect(ProjectSerializer.deserialize('{"foo": "bar"}')).toBeNull();
  });
});
