import React from 'react';
import { ProductionCard, KanbanColumn } from '../types';
import { useMobileCardState } from '../hooks/useMobileCardState';
import MobileCardForm from './mobile/MobileCardForm';

interface MobileCardEditorProps {
  card: ProductionCard;
  columns: KanbanColumn[];
  onSave: (updatedCard: ProductionCard) => void;
  onMove: (cardId: string, targetColumnId: string) => void;
  onDelete: (cardId: string) => void;
  onClose: () => void;
  onOpenStoryboard?: (card: ProductionCard) => void;
}

const MobileCardEditor: React.FC<MobileCardEditorProps> = ({
  card,
  columns,
  onSave,
  onMove,
  onDelete,
  onClose,
  onOpenStoryboard,
}) => {
  const state = useMobileCardState(card, columns, onSave);

  const handleMove = (targetColumnId: string) => {
    onMove(card.id, targetColumnId);
    state.setShowMoveMenu(false);
    onClose();
  };

  const handleDelete = () => {
    onDelete(card.id);
    onClose();
  };

  return (
    <MobileCardForm
      card={card}
      columns={columns}
      onClose={onClose}
      onOpenStoryboard={onOpenStoryboard}
      {...state}
      onMove={handleMove}
      onDelete={handleDelete}
      onSaveCard={onSave}
    />
  );
};

export default MobileCardEditor;
