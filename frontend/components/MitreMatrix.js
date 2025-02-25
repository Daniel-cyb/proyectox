// components/MitreMatrix.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './MitreMatrix.css'; // Import CSS

const MitreMatrix = () => {
  const [tactics, setTactics] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('/data/enterprise-attack.json');
      const attackPatterns = response.data.objects.filter(item => item.type === 'attack-pattern');
      const tactics = response.data.objects.filter(item => item.type === 'x-mitre-tactic');
      const tacticsMap = {};
      
      tactics.forEach(tactic => {
        tacticsMap[tactic.x_mitre_shortname] = {
          name: tactic.name,
          id: tactic.id,
          techniques: [],
        };
      });
      
      attackPatterns.forEach(pattern => {
        pattern.kill_chain_phases.forEach(phase => {
          if (tacticsMap[phase.phase_name]) {
            tacticsMap[phase.phase_name].techniques.push(pattern);
          }
        });
      });

      setTactics(Object.values(tacticsMap));
    };

    fetchData();
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceTacticIndex = tactics.findIndex(tactic => tactic.id === result.source.droppableId);
    const destinationTacticIndex = tactics.findIndex(tactic => tactic.id === result.destination.droppableId);
    const sourceTactic = tactics[sourceTacticIndex];
    const destinationTactic = tactics[destinationTacticIndex];

    const [movedTechnique] = sourceTactic.techniques.splice(result.source.index, 1);
    destinationTactic.techniques.splice(result.destination.index, 0, movedTechnique);

    const newTactics = Array.from(tactics);
    newTactics[sourceTacticIndex] = sourceTactic;
    newTactics[destinationTacticIndex] = destinationTactic;

    setTactics(newTactics);
  };

  return (
    <div>
      <h1>Enterprise ATT&CK Matrix</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="mitre-matrix">
          {tactics.map(tactic => (
            <Droppable droppableId={tactic.id} key={tactic.id}>
              {(provided) => (
                <div
                  className="tactic-column"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <div className="tactic-header">{tactic.name}</div>
                  {tactic.techniques.map((technique, index) => (
                    <Draggable draggableId={technique.id} index={index} key={technique.id}>
                      {(provided) => (
                        <div
                          className="technique-cell"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="technique-name">{technique.name}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default MitreMatrix;
