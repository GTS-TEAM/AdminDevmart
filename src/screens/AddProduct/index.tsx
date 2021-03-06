import { Button, Col, message, Row, TreeSelect, Upload } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { eCommerceApis } from 'apis';
import { Auth, Card, HeaderBreadcrumb, Layout } from 'components';
import { ROUTES } from 'constant';
import { InputCustom } from 'custom';
import React, { useCallback, useState } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { ICategory, IVariantInput, WithLayout } from 'shared/types';
import { SpecificForm, VariantInputs } from './components';

const itemsHeaderBreadcrumb: Array<{ name: string; path?: string }> = [
   {
      name: 'Dashboard',
      path: ROUTES.HOME,
   },
   {
      name: 'Products',
      path: ROUTES.PRODUCTS,
   },
   {
      name: 'Add product',
   },
];

interface Props {
   categories: ICategory[];
}

const AddProduct: WithLayout = ({ categories }: Props) => {
   const [imagesLibrary, setImagesLibrary] = useState<UploadFile[]>([]);
   const [categoriesId, setCategoriesId] = useState<{ [key: string]: any }>({});
   const [description, setDescription] = useState<string>('');
   const [price, setPrice] = useState<number>(1000);
   const [specific, setSpecific] = useState<{
      [key: string]: string;
   }>({});
   const [name, setName] = useState<string>('');
   const [loading, setLoading] = useState<boolean>(false);
   const [variants, setVariants] = useState<IVariantInput[]>([]);

   const handleReset = useCallback(() => {
      setImagesLibrary([]);
      setCategoriesId({});
      setDescription('');
      setPrice(1000);
      setSpecific({});
      setName('');
      setVariants([]);
   }, []);

   const handleAddProduct = useCallback(async () => {
      try {
         setLoading(true);

         if (
            imagesLibrary.length === 0 ||
            name.trim().length === 0 ||
            Object.keys(categoriesId).length === 0 ||
            description.trim().length === 0
         ) {
            throw new Error('Maybe you miss field is required. Try again!');
         }

         const formData = new FormData();

         for (const imgFile of imagesLibrary) {
            formData.append('files', imgFile.originFileObj as Blob);
         }

         const {
            data: { urls },
         } = await eCommerceApis.uploadImages(formData);

         const newProduct = {
            name,
            description,
            price,
            specific,
            images: urls,
            categories_id: categoriesId,
            variants: variants.map((_variant) => {
               return {
                  key: _variant.key,
                  values: _variant.values,
               };
            }),
         };

         const {
            data: { data: productAdded, message: _message },
         } = await eCommerceApis.addProduct(newProduct);

         message.success(_message);
         setLoading(false);
         handleReset();
      } catch (error: any) {
         message.error(error.message);
         setLoading(false);
      }
   }, [
      categoriesId,
      description,
      name,
      price,
      specific,
      variants,
      imagesLibrary,
      handleReset,
   ]);

   return (
      <div className="flex flex-col h-full">
         <HeaderBreadcrumb title="Add product" items={itemsHeaderBreadcrumb} />
         <div className="w-full h-full flex-1">
            <Row gutter={16} className="h-full">
               <Col span={16} className="flex flex-col gap-4">
                  <Card customHeader={<></>} isHaveClassBody>
                     <div className="w-full flex flex-col gap-4">
                        <InputCustom
                           placeholder="Enter product title"
                           label="Product title"
                           isRequire={true}
                           value={name}
                           onChange={(e) => {
                              setName(e.target.value);
                           }}
                        />
                        <div>
                           <InputCustom
                              isTextArea
                              isRequire
                              label="Product Description"
                              onChange={(e) => {
                                 setDescription(e.target.value);
                              }}
                              propsTextArea={{
                                 onChange: (e) => {
                                    setDescription(e.target.value);
                                 },
                                 value: description,
                                 placeholder: 'Enter product description',
                              }}
                           />
                        </div>
                     </div>
                  </Card>
                  <Card title="Pricing" isHaveClassBody>
                     <p className="text-muted mb-2">Add price to product</p>
                     <InputCustom
                        label="Price"
                        placeholder="Enter price"
                        type="number"
                        value={price}
                        onChange={(e) => {
                           setPrice(+e.target.value);
                        }}
                        isRequire={true}
                     />
                  </Card>
                  <Card title="Product Gallery" isHaveClassBody>
                     <div className="flex flex-col gap-4">
                        <div className="vz-gallery">
                           <label className="vz-add-product-label">
                              Product Gallery
                              <span className="text-red-600 ml-1">*</span>
                           </label>
                           <span className="text-muted mb-4 block">
                              Add Product Gallery Images.
                           </span>
                           <div>
                              <Upload.Dragger
                                 className="vz-upload"
                                 accept="image/png, image/jpeg"
                                 fileList={imagesLibrary}
                                 onChange={(info) => {
                                    setImagesLibrary(info.fileList);
                                 }}
                                 listType="picture"
                              >
                                 <div className="flex flex-col items-center justify-center">
                                    <AiOutlineCloudUpload className="w-14 h-14 my-7 text-vz-text-color-body" />
                                    <h5 className="font-medium">
                                       Drop files here or click to upload.
                                    </h5>
                                 </div>
                              </Upload.Dragger>
                           </div>
                        </div>
                     </div>
                  </Card>
                  <VariantInputs
                     onVariantsChange={(variants) => {
                        setVariants(variants);
                     }}
                  />
                  <SpecificForm
                     onChange={(specific) => {
                        setSpecific(specific);
                     }}
                  />
                  <Button
                     className="vz-button vz-button-primary self-end"
                     onClick={handleAddProduct}
                     loading={loading}
                  >
                     Submit
                  </Button>
               </Col>
               <Col span={8} className="flex flex-col gap-4">
                  <Card title="Product Categories" isHaveClassBody>
                     <label className="vz-add-product-label">
                        Choose categories
                        <span className="text-red-600 ml-1">*</span>
                     </label>
                     <p className="text-muted mb-2">Select product category</p>
                     <TreeSelect
                        className="w-full vz-select"
                        treeData={categories}
                        treeCheckable={true}
                        showCheckedStrategy={TreeSelect.SHOW_PARENT}
                        placeholder="Choose categories"
                        dropdownClassName="vz-dropdown"
                        onChange={(values) => {
                           setCategoriesId(values);
                        }}
                     />
                  </Card>
                  <Card title="Product Short Description" isHaveClassBody>
                     <p className="text-muted mb-2">
                        Add short description for product
                     </p>
                     <InputCustom isTextArea={true} />
                  </Card>
               </Col>
            </Row>
         </div>
      </div>
   );
};

AddProduct.getLayout = (page) => {
   return (
      <Auth>
         <Layout>{page}</Layout>
      </Auth>
   );
};

export default AddProduct;
