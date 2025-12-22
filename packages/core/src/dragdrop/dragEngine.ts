import type { BaseComponent } from '@lego/utils';
import { eventHub } from '@lego/event-hub';

export class DragEngine {
  private draggedComponent: BaseComponent | null = null;
  private dragOverElement: string | null = null;

  startDrag(component: BaseComponent) {
    this.draggedComponent = component;
    eventHub.emit('dragstart', component);
  }

  endDrag() {
    if (this.draggedComponent) {
      eventHub.emit('dragend', this.draggedComponent);
      this.draggedComponent = null;
    }
  }

  dragOver(elementId: string) {
    if (this.dragOverElement !== elementId) {
      this.dragOverElement = elementId;
      eventHub.emit('dragover', elementId);
    }
  }

  drop(targetElementId: string): boolean {
    if (this.draggedComponent) {
      eventHub.emit('drop', {
        component: this.draggedComponent,
        targetId: targetElementId,
      });
      this.draggedComponent = null;
      return true;
    }
    return false;
  }

  getDraggedComponent() {
    return this.draggedComponent;
  }
}

export const dragEngine = new DragEngine();