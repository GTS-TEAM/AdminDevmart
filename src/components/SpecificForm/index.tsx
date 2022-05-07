import { Button, Col, Row } from 'antd';
import Card from 'components/Card';
import { InputCustom } from 'custom';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
   onChange?: (specific: { [key: string]: string }) => any;
}

const SpecificForm: React.FC<Props> = ({ onChange }) => {
   const [specifics, setSpecifics] = useState<
      { id: string; [key: string]: string }[]
   >([
      {
         id: '1',
         name: '',
         value: '',
      },
   ]);

   const handleChange = (
      event: React.ChangeEvent<HTMLInputElement>,
      index: number
   ) => {
      let data = [...specifics];
      data[index][event.target.name] = event.target.value;
      setSpecifics(data);
   };

   const handleAddMoreSpecific = () => {
      const newSpecific = {
         id: uuidv4(),
         name: '',
         value: '',
      };
      setSpecifics([...specifics, newSpecific]);
   };

   useEffect(() => {
      const _specific: { [key: string]: string } = specifics.reduce(
         (prev, current) => {
            return {
               ...prev,
               [current.name]: current.value,
            };
         },
         {}
      );

      if (_specific?.name?.trim().length !== 0) {
         onChange && onChange(_specific);
      } else {
         onChange && onChange({});
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [specifics]);

   return (
      <Card title="Specific">
         <div>
            <ul>
               {specifics.map((specific, index) => {
                  return (
                     <li key={specific.id} className="mb-4 last:mb-0 ">
                        <Row gutter={16} className="w-full">
                           <Col span={20}>
                              <div className="flex items-center gap-4 flex-1">
                                 <InputCustom
                                    classNameWrap="w-full"
                                    label="Specific name"
                                    name="name"
                                    value={specific.name}
                                    onChange={(e) => {
                                       handleChange(e, index);
                                    }}
                                 />
                                 <InputCustom
                                    classNameWrap="w-full"
                                    label="Specific value"
                                    value={specific.value}
                                    name="value"
                                    onChange={(e) => {
                                       handleChange(e, index);
                                    }}
                                 />
                              </div>
                           </Col>
                           <Col
                              span={4}
                              className="flex items-end justify-center"
                           >
                              {index !== 0 && (
                                 <button
                                    className="h-[37.5px] w-full flex-1 bg-red-200 text-red-500 rounded"
                                    onClick={() => {
                                       setSpecifics(
                                          [...specifics].filter(
                                             (_specific) =>
                                                _specific.id !== specific.id
                                          )
                                       );
                                    }}
                                 >
                                    Remove
                                 </button>
                              )}
                           </Col>
                        </Row>
                     </li>
                  );
               })}
            </ul>
            <Button
               className="vz-button vz-button-primary mt-4"
               onClick={handleAddMoreSpecific}
            >
               Add more specific
            </Button>
         </div>
      </Card>
   );
};

export default React.memo(SpecificForm);